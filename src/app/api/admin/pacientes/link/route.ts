import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { checkAdminApi, hasPermission } from "@/src/lib/auth-helpers-server";
import { withAudit } from "@/src/lib/audit";
import { generatedLinkSchema } from "@/src/schemas/paciente";

async function _POST(request: Request) {
    const session = await checkAdminApi();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (!hasPermission(session, "pacientes", "criar")) {
        return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }
    try {
        const body = await request.json();
        const validation = generatedLinkSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Dados inválidos", details: validation.error.format() },
                { status: 400 }
            );
        }

        const { patientName, hasAnamnesis, formType } = validation.data;
        const token = crypto.randomUUID();
        const generatedLink = await prisma.generatedLink.create({
            data: {
                patientName,
                hasAnamnesis,
                formType,
                token,
                link: `${process.env.NEXTAUTH_URL}/formulario/${token}`,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
                //expiresAt: new Date(Date.now() + 3 * 60 * 1000),
            },
        });

        return NextResponse.json({ generatedLink }, { status: 201 });
    } catch (error) {
        console.error("Erro ao criar link:", error);
        return NextResponse.json({ error: "Erro ao criar link" }, { status: 500 });
    }
}

export const POST = withAudit(_POST, {
    resource: "Link de anamnese",
    getResourceName: (data: any) => data.patientName
});
