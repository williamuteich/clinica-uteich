import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { checkAdminApi } from "@/src/lib/auth-helpers-server";
import { decrypt, isEncrypted } from "@/src/lib/encrypted-fields";

async function tryDecrypt(val: string | null | undefined): Promise<string> {
    if (!val) return "";
    if (isEncrypted(val)) {
        try {
            return await decrypt(val);
        } catch {
            return "[Erro de Descriptografia]";
        }
    }
    return val;
}

export async function GET() {
    const session = await checkAdminApi();
    if (!session) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    try {
        const now = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(now.getDate() - 60);

        const [
            currentLeads,
            prevLeadsCount,
            appointments,
            prevAppointmentsCount,
            totalPatients
        ] = await Promise.all([
            prisma.lead.findMany({
                where: { createdAt: { gte: thirtyDaysAgo } },
                orderBy: { createdAt: "desc" }
            }),
            prisma.lead.count({
                where: {
                    createdAt: {
                        gte: sixtyDaysAgo,
                        lt: thirtyDaysAgo
                    }
                }
            }),
            prisma.appointment.findMany({
                where: {
                    createdAt: { gte: thirtyDaysAgo }
                },
                include: {
                    patient: {
                        select: { name: true }
                    }
                },
                orderBy: { createdAt: "desc" }
            }),
            prisma.appointment.count({
                where: {
                    createdAt: {
                        gte: sixtyDaysAgo,
                        lt: thirtyDaysAgo
                    }
                }
            }),
            prisma.patient.count({
                where: { active: true }
            })
        ]);

        const decryptedLeads = await Promise.all(
            currentLeads.map(async (l) => ({
                id: l.id,
                name: await tryDecrypt(l.name),
                phone: await tryDecrypt(l.phone),
                serviceType: await tryDecrypt(l.serviceType),
                status: l.status,
                utmSource: l.utmSource,
                utmMedium: l.utmMedium,
                utmCampaign: l.utmCampaign,
                createdAt: l.createdAt.toISOString()
            }))
        );

        const decryptedAppointments = await Promise.all(
            appointments.map(async (a) => {
                let patientName = a.patient?.name || "";
                if (!patientName && a.guestName) {
                    patientName = await tryDecrypt(a.guestName);
                }
                return {
                    id: a.id,
                    patientName,
                    serviceType: await tryDecrypt(a.serviceType),
                    scheduledAt: a.scheduledAt.toISOString(),
                    status: a.status,
                    createdAt: a.createdAt.toISOString()
                };
            })
        );

        const upcomingRaw = await prisma.appointment.findMany({
            where: {
                scheduledAt: { gte: now },
                status: { not: "CANCELLED" }
            },
            include: {
                patient: { select: { name: true } }
            },
            orderBy: { scheduledAt: "asc" },
            take: 5
        });

        const upcomingAppointments = await Promise.all(
            upcomingRaw.map(async (a) => {
                let patientName = a.patient?.name || "";
                if (!patientName && a.guestName) {
                    patientName = await tryDecrypt(a.guestName);
                }
                return {
                    id: a.id,
                    patientName,
                    serviceType: await tryDecrypt(a.serviceType),
                    scheduledAt: a.scheduledAt.toISOString(),
                    status: a.status,
                };
            })
        );

        const currLeadsCount = decryptedLeads.length;
        const leadsTrend = prevLeadsCount ? ((currLeadsCount - prevLeadsCount) / prevLeadsCount) * 100 : 0;

        const currAppointmentsCount = decryptedAppointments.length;
        const appointmentsTrend = prevAppointmentsCount ? ((currAppointmentsCount - prevAppointmentsCount) / prevAppointmentsCount) * 100 : 0;

        const convertedLeadsCount = decryptedLeads.filter(l => 
            ["PENDING", "CONFIRMED", "COMPLETED"].includes(l.status)
        ).length;
        const conversionRate = currLeadsCount ? Math.round((convertedLeadsCount / currLeadsCount) * 100) : 0;

        const dailyDataMap: { [dateStr: string]: { leads: number; appointments: number } } = {};
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(now.getDate() - i);
            const dateStr = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
            dailyDataMap[dateStr] = { leads: 0, appointments: 0 };
        }

        decryptedLeads.forEach(l => {
            const dateStr = new Date(l.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
            if (dailyDataMap[dateStr]) {
                dailyDataMap[dateStr].leads++;
            }
        });

        decryptedAppointments.forEach(a => {
            const dateStr = new Date(a.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
            if (dailyDataMap[dateStr]) {
                dailyDataMap[dateStr].appointments++;
            }
        });

        const dailyData = Object.entries(dailyDataMap).map(([date, counts]) => ({
            date,
            ...counts
        }));

        const sourceCounts: { [source: string]: number } = {
            "Google Ads": 0,
            "Meta Ads": 0,
            "WhatsApp": 0,
            "Direto / Orgânico": 0,
            "Outros": 0
        };

        currentLeads.forEach(l => {
            const src = (l.utmSource || "").toLowerCase();
            if (l.gclid || src.includes("google") || src.includes("gclid") || src.includes("adwords")) {
                sourceCounts["Google Ads"]++;
            } else if (src.includes("facebook") || src.includes("instagram") || src.includes("meta") || src.includes("fb") || src.includes("ig")) {
                sourceCounts["Meta Ads"]++;
            } else if (src.includes("whatsapp") || src.includes("wa")) {
                sourceCounts["WhatsApp"]++;
            } else if (!l.utmSource && !l.gclid) {
                sourceCounts["Direto / Orgânico"]++;
            } else {
                sourceCounts["Outros"]++;
            }
        });

        const sourceData = Object.entries(sourceCounts)
            .map(([name, value]) => ({ name, value }))
            .filter(item => item.value > 0);

        const serviceCounts: { [service: string]: number } = {};
        decryptedAppointments.forEach(a => {
            const srv = a.serviceType || "Outros";
            serviceCounts[srv] = (serviceCounts[srv] || 0) + 1;
        });

        const specialtyData = Object.entries(serviceCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);

        return NextResponse.json({
            stats: {
                totalLeads: currLeadsCount,
                leadsTrend,
                totalAppointments: currAppointmentsCount,
                appointmentsTrend,
                totalPatients,
                conversionRate
            },
            dailyData,
            sourceData,
            specialtyData,
            recentLeads: decryptedLeads.slice(0, 5),
            recentAppointments: upcomingAppointments
        });

    } catch (error) {
        console.error("Erro no GET dashboard route:", error);
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}
