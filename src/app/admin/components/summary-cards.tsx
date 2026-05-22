"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

interface Stats {
    admins: number;
}

export function DashboardSummary() {
    const [stats, setStats] = useState<Stats>({ admins: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const adminsRes = await fetch("/api/admin/usuarios");
                const admins = await adminsRes.json();

                setStats({
                    admins: Array.isArray(admins) ? admins.length : 0,
                });
            } catch (error) {
                console.error("Erro ao buscar estatísticas:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchStats();
    }, []);

    const cards = [
        {
            title: "Administradores",
            value: stats.admins,
            icon: ShieldCheck,
            description: "Acesso total ao sistema",
            color: "text-blue-500",
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-1">
            {cards.map((card) => (
                <Card key={card.title} className="overflow-hidden border-none bg-background/50 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                        <card.icon className={`h-4 w-4 ${card.color}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {loading ? <div className="h-8 w-12 animate-pulse bg-muted rounded" /> : card.value}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {card.description}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
