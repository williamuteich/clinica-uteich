import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { checkAdminApi, hasPermission } from "@/src/lib/auth-helpers-server";
import { anamneseSchema } from "@/src/schemas/anamnese";
import { withAudit } from "@/src/lib/audit";
import { encrypt, decrypt, isEncrypted } from "@/src/lib/encrypted-fields";
import { cacheLife, cacheTag, revalidateTag } from "next/cache";

type Ctx = { params: Promise<{ id: string }> };
const getId = async (ctx: Ctx) => (await ctx.params).id;

const ENCRYPTED_FIELDS = [
    { name: "observations", action: encrypt, shouldProcess: (val: string) => !isEncrypted(val) },
    { name: "doctorRecommendations", action: encrypt, shouldProcess: (val: string) => !isEncrypted(val) },
    { name: "panicOrBehaviorNotes", action: encrypt, shouldProcess: (val: string) => !isEncrypted(val) },
] as const;

const DECRYPT_FIELDS = [
    { name: "observations", action: decrypt, shouldProcess: (val: string) => isEncrypted(val) },
    { name: "doctorRecommendations", action: decrypt, shouldProcess: (val: string) => isEncrypted(val) },
    { name: "panicOrBehaviorNotes", action: decrypt, shouldProcess: (val: string) => isEncrypted(val) },
] as const;

async function processObject(obj: any, fields: typeof ENCRYPTED_FIELDS | typeof DECRYPT_FIELDS): Promise<any> {
    if (!obj) return obj;
    const res = { ...obj };
    for (const field of fields) {
        const val = res[field.name];
        if (typeof val === "string" && val.trim() !== "" && field.shouldProcess(val)) {
            try {
                res[field.name] = await field.action(val);
            } catch (error) {
                console.error(`Erro ao processar campo ${field.name}:`, error);
            }
        }
    }
    return res;
}

async function encryptAnamnese(data: any): Promise<any> {
    if (!data) return data;
    const base = await processObject(data, ENCRYPTED_FIELDS);
    
    if (base.diseases && Array.isArray(base.diseases)) {
        base.diseases = await Promise.all(base.diseases.map(async (d: any) => {
            const res = { ...d };
            if (res.name && typeof res.name === "string" && !res.name.includes(":")) {
                res.name = await encrypt(res.name);
            }
            if (res.observations && typeof res.observations === "string" && !res.observations.includes(":")) {
                res.observations = await encrypt(res.observations);
            }
            return res;
        }));
    }
    
    if (base.allergies && Array.isArray(base.allergies)) {
        base.allergies = await Promise.all(base.allergies.map(async (a: any) => {
            const res = { ...a };
            if (res.substance && typeof res.substance === "string" && !res.substance.includes(":")) {
                res.substance = await encrypt(res.substance);
            }
            if (res.reaction && typeof res.reaction === "string" && !res.reaction.includes(":")) {
                res.reaction = await encrypt(res.reaction);
            }
            return res;
        }));
    }
    
    if (base.medications && Array.isArray(base.medications)) {
        base.medications = await Promise.all(base.medications.map(async (m: any) => {
            const res = { ...m };
            if (res.medication && typeof res.medication === "string" && !res.medication.includes(":")) {
                res.medication = await encrypt(res.medication);
            }
            if (res.dosage && typeof res.dosage === "string" && !res.dosage.includes(":")) res.dosage = await encrypt(res.dosage);
            if (res.frequency && typeof res.frequency === "string" && !res.frequency.includes(":")) res.frequency = await encrypt(res.frequency);
            if (res.medicalFollowUp && typeof res.medicalFollowUp === "string" && !res.medicalFollowUp.includes(":")) res.medicalFollowUp = await encrypt(res.medicalFollowUp);
            return res;
        }));
    }
    
    return base;
}

async function decryptAnamnese(data: any): Promise<any> {
    if (!data) return data;
    const base = await processObject(data, DECRYPT_FIELDS);
    
    if (base.diseases && Array.isArray(base.diseases)) {
        base.diseases = await Promise.all(base.diseases.map(async (d: any) => {
            const res = { ...d };
            if (res.name && typeof res.name === "string" && res.name.includes(":")) {
                res.name = await decrypt(res.name);
            }
            if (res.observations && typeof res.observations === "string" && res.observations.includes(":")) {
                res.observations = await decrypt(res.observations);
            }
            return res;
        }));
    }
    
    if (base.allergies && Array.isArray(base.allergies)) {
        base.allergies = await Promise.all(base.allergies.map(async (a: any) => {
            const res = { ...a };
            if (res.substance && typeof res.substance === "string" && res.substance.includes(":")) {
                res.substance = await decrypt(res.substance);
            }
            if (res.reaction && typeof res.reaction === "string" && res.reaction.includes(":")) {
                res.reaction = await decrypt(res.reaction);
            }
            return res;
        }));
    }
    
    if (base.medications && Array.isArray(base.medications)) {
        base.medications = await Promise.all(base.medications.map(async (m: any) => {
            const res = { ...m };
            if (res.medication && typeof res.medication === "string" && res.medication.includes(":")) {
                res.medication = await decrypt(res.medication);
            }
            if (res.dosage && typeof res.dosage === "string" && res.dosage.includes(":")) res.dosage = await decrypt(res.dosage);
            if (res.frequency && typeof res.frequency === "string" && res.frequency.includes(":")) res.frequency = await decrypt(res.frequency);
            if (res.medicalFollowUp && typeof res.medicalFollowUp === "string" && res.medicalFollowUp.includes(":")) res.medicalFollowUp = await decrypt(res.medicalFollowUp);
            return res;
        }));
    }
    
    return base;
}

async function getAnamneseFromDb(patientId: string) {
    "use cache";
    cacheLife("hours");
    cacheTag("anamnese-list");

    return prisma.anamnese.findFirst({
        where: { patientId },
        include: {
            diseases: true,
            allergies: true,
            medications: true,
        },
        orderBy: { createdAt: "desc" },
    });
}

export async function GET(_req: Request, ctx: Ctx) {
    const session = await checkAdminApi();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (!hasPermission(session, "pacientes", "visualizar")) {
        return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const patientId = await getId(ctx);
    const anamnese = await getAnamneseFromDb(patientId);

    if (!anamnese) return NextResponse.json(null);
    return NextResponse.json(await decryptAnamnese(anamnese));
}

async function _POST(request: Request, ctx: Ctx) {
    const session = await checkAdminApi();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (!hasPermission(session, "pacientes", "editar")) {
        return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    try {
        const patientId = await getId(ctx);
        const body = await request.json();
        const validated = anamneseSchema.safeParse({ ...body, patientId });
        if (!validated.success) {
            return NextResponse.json({ error: validated.error.issues[0].message }, { status: 400 });
        }

        const encryptedData = await encryptAnamnese(validated.data);
        const existing = await prisma.anamnese.findFirst({
            where: { patientId },
        });

        let resultAnamnese;

        if (existing) {
            await prisma.$transaction([
                prisma.anamneseDisease.deleteMany({ where: { anamneseId: existing.id } }),
                prisma.anamneseAllergy.deleteMany({ where: { anamneseId: existing.id } }),
                prisma.continuousMedication.deleteMany({ where: { anamneseId: existing.id } }),
            ]);

            resultAnamnese = await prisma.anamnese.update({
                where: { id: existing.id },
                data: {
                    observations: encryptedData.observations || null,
                    doctorRecommendations: encryptedData.doctorRecommendations || null,
                    panicOrBehaviorNotes: encryptedData.panicOrBehaviorNotes || null,
                    requiresMedicalClearance: encryptedData.requiresMedicalClearance,
                    diseases: {
                        create: encryptedData.diseases.map((d: any) => ({
                            name: d.name,
                            observations: d.observations || null,
                        })),
                    },
                    allergies: {
                        create: encryptedData.allergies.map((a: any) => ({
                            substance: a.substance,
                            reaction: a.reaction || null,
                        })),
                    },
                    medications: {
                        create: encryptedData.medications.map((m: any) => ({
                            medication: m.medication,
                            dosage: m.dosage || null,
                            frequency: m.frequency || null,
                            medicalFollowUp: m.medicalFollowUp || null,
                        })),
                    },
                },
                include: {
                    diseases: true,
                    allergies: true,
                    medications: true,
                }
            });
        } else {
            resultAnamnese = await prisma.anamnese.create({
                data: {
                    patientId,
                    observations: encryptedData.observations || null,
                    doctorRecommendations: encryptedData.doctorRecommendations || null,
                    panicOrBehaviorNotes: encryptedData.panicOrBehaviorNotes || null,
                    requiresMedicalClearance: encryptedData.requiresMedicalClearance,
                    diseases: {
                        create: encryptedData.diseases.map((d: any) => ({
                            name: d.name,
                            observations: d.observations || null,
                        })),
                    },
                    allergies: {
                        create: encryptedData.allergies.map((a: any) => ({
                            substance: a.substance,
                            reaction: a.reaction || null,
                        })),
                    },
                    medications: {
                        create: encryptedData.medications.map((m: any) => ({
                            medication: m.medication,
                            dosage: m.dosage || null,
                            frequency: m.frequency || null,
                            medicalFollowUp: m.medicalFollowUp || null,
                        })),
                    },
                },
                include: {
                    diseases: true,
                    allergies: true,
                    medications: true,
                }
            });
        }

        revalidateTag("anamnese-list", "max");
        return NextResponse.json(await decryptAnamnese(resultAnamnese), { status: 200 });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}

export const POST = withAudit(_POST, {
    resource: "paciente/anamnese",
    getResourceId: getId,
    getResourceName: async (data: any) => {
        const p = await prisma.patient.findUnique({ where: { id: data.patientId }, select: { name: true } });
        return p?.name || "Paciente Desconhecido";
    },
    getUrl: async (ctx) => {
        const params = await ctx.params;
        return `/admin/pacientes/${params.id}?tab=anamnese`;
    }
});
