import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { encrypt } from "@/src/lib/encrypted-fields";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            leadId,
            name,
            phone,
            serviceType,
            observation,
            gclid,
            utmSource,
            utmMedium,
            utmCampaign,
            utmContent,
            utmTerm,
        } = body;

        if (!name || !phone) {
            return NextResponse.json({ error: "Nome e telefone são obrigatórios" }, { status: 400 });
        }

        const encryptedName = await encrypt(name);
        const encryptedPhone = await encrypt(phone);
        const encryptedServiceType = serviceType ? await encrypt(serviceType) : null;
        const encryptedObservation = observation ? await encrypt(observation) : null;

        let lead;
        if (leadId) {
            lead = await prisma.lead.update({
                where: { id: leadId },
                data: {
                    name: encryptedName,
                    phone: encryptedPhone,
                    serviceType: encryptedServiceType,
                    observation: encryptedObservation,
                    gclid,
                    utmSource,
                    utmMedium,
                    utmCampaign,
                    utmContent,
                    utmTerm,
                },
            });
        } else {
            lead = await prisma.lead.create({
                data: {
                    name: encryptedName,
                    phone: encryptedPhone,
                    serviceType: encryptedServiceType,
                    observation: encryptedObservation,
                    status: "INTERESTED",
                    step: 1,
                    gclid,
                    utmSource,
                    utmMedium,
                    utmCampaign,
                    utmContent,
                    utmTerm,
                },
            });
        }

        return NextResponse.json({ success: true, leadId: lead.id });
    } catch (error) {
        console.error("Erro ao salvar lead:", error);
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}
