import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { pacienteSchema } from "@/src/schemas/paciente";
import { encrypt, encryptDeterministic } from "@/src/lib/encrypted-fields";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";



export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const generatedLink = await prisma.generatedLink.findUnique({
            where: { token: id },
        });

        if (!generatedLink) {
            return NextResponse.json({ error: "Link inválido" }, { status: 404 });
        }

        if (generatedLink.used) {
            return NextResponse.json({ error: "Link já utilizado" }, { status: 400 });
        }

        if (new Date() > new Date(generatedLink.expiresAt)) {
            return NextResponse.json({ error: "Link expirado" }, { status: 400 });
        }

        const body = await request.json();

        const schema = z.object({
            formData: pacienteSchema,
            queixaPrincipal: z.string().optional().nullable(),
            responses: z.record(
                z.string(),
                z.object({
                    answer: z.string(),
                    notes: z.string().optional().nullable(),
                })
            ).optional().nullable(),
        });

        const validated = schema.safeParse(body);
        if (!validated.success) {
            return NextResponse.json(
                { error: validated.error.issues[0].message },
                { status: 400 }
            );
        }

        const { formData, queixaPrincipal, responses } = validated.data;
        const encryptedCpf = formData.cpf ? await encryptDeterministic(formData.cpf) : null;
        const encryptedPhone = await encryptDeterministic(formData.phone);
        const encryptedNumber = formData.number ? await encrypt(formData.number) : null;
        const encryptedComplement = formData.complement ? await encrypt(formData.complement) : null;
        const encryptedEmergencyPhone = formData.emergencyPhone ? await encrypt(formData.emergencyPhone) : null;
        const encryptedRepresentativeCpf = formData.representativeCpf
            ? await encrypt(formData.representativeCpf)
            : null;

        const patientsWithPhone = await prisma.patient.findMany({ select: { id: true, phone: true } });
        for (const p of patientsWithPhone) {
            if (p.phone === encryptedPhone) {
                return NextResponse.json(
                    { error: "Telefone já cadastrado no sistema" },
                    { status: 400 }
                );
            }
        }

        if (encryptedCpf) {
            const existingCpf = await prisma.patient.findFirst({
                where: { cpf: encryptedCpf },
            });
            if (existingCpf) {
                return NextResponse.json(
                    { error: "CPF já cadastrado no sistema" },
                    { status: 400 }
                );
            }
        }

        const result = await prisma.$transaction(async (tx) => {
            const patient = await tx.patient.create({
                data: {
                    name: formData.name,
                    cpf: encryptedCpf,
                    birthDate: new Date(formData.birthDate),
                    phone: encryptedPhone,
                    email: formData.email || null,
                    profession: formData.profession || null,
                    gender: formData.gender || null,
                    howKnewClinic: formData.howKnewClinic || null,
                    zipCode: formData.zipCode || null,
                    state: formData.state || null,
                    city: formData.city || null,
                    neighborhood: formData.neighborhood || null,
                    street: formData.street || null,
                    number: encryptedNumber,
                    complement: encryptedComplement,
                    emergencyName: formData.emergencyName || null,
                    emergencyPhone: encryptedEmergencyPhone,
                    representativeName: formData.representativeName || null,
                    representativeCpf: encryptedRepresentativeCpf,
                    representativeBirthDate: formData.representativeBirthDate
                        ? new Date(formData.representativeBirthDate)
                        : null,
                    observations: formData.observations || null,
                },
            });

            if (generatedLink.hasAnamnesis) {
                const diseasesToCreate: any[] = [];
                const allergiesToCreate: any[] = [];
                const medicationsToCreate: any[] = [];
                let formattedObservations = `Formulário preenchido pelo paciente no pré-cadastro.\nTipo: ${generatedLink.formType}\n`;

                if (queixaPrincipal) {
                    formattedObservations += `Queixa Principal: ${queixaPrincipal}\n\n`;
                }
                formattedObservations += `Respostas do Questionário:\n`;

                if (responses) {
                    for (const [questionId, responseVal] of Object.entries(
                        responses as Record<string, { answer: string; notes?: string }>
                    )) {
                        const isYes = responseVal.answer === "SIM";
                        const noteText = responseVal.notes ? ` (Obs: ${responseVal.notes})` : "";
                        formattedObservations += `- ${questionId}: ${responseVal.answer}${noteText}\n`;

                        if (isYes) {
                            const qIdLower = questionId.toLowerCase();
                            if (qIdLower.includes("alergia") || qIdLower.includes("alérgico")) {
                                allergiesToCreate.push({
                                    substance: await encrypt(questionId),
                                    reaction: responseVal.notes ? await encrypt(responseVal.notes) : null,
                                });
                            } else if (
                                qIdLower.includes("medicação") ||
                                qIdLower.includes("medicamento") ||
                                qIdLower.includes("remédio")
                            ) {
                                medicationsToCreate.push({
                                    medication: await encrypt(questionId),
                                    dosage: responseVal.notes ? await encrypt(responseVal.notes) : null,
                                });
                            } else {
                                diseasesToCreate.push({
                                    name: await encrypt(questionId),
                                    observations: responseVal.notes ? await encrypt(responseVal.notes) : null,
                                });
                            }
                        }
                    }
                }

                const encryptedObservations = await encrypt(formattedObservations);

                await tx.anamnese.create({
                    data: {
                        patientId: patient.id,
                        observations: encryptedObservations,
                        diseases: {
                            create: diseasesToCreate,
                        },
                        allergies: {
                            create: allergiesToCreate,
                        },
                        medications: {
                            create: medicationsToCreate,
                        },
                    },
                });
            }

            await tx.generatedLink.update({
                where: { token: id },
                data: { used: true },
            });

            return patient;
        });

        revalidatePath("/admin/pacientes");
        revalidateTag("pacientes-list", "max");

        return NextResponse.json({ success: true, patientId: result.id }, { status: 201 });
    } catch (error: any) {
        console.error("Erro ao registrar paciente pelo formulário:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor ao processar o cadastro" },
            { status: 500 }
        );
    }
}
