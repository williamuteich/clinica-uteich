"use client";

import { DashboardOverviewProps } from "@/src/types/dashboard/dashboard";
import { KpiCards } from "./kpi-cards";
import { ChartsSection } from "./charts-section";
import { RecentActivity } from "./recent-activity";

export function DashboardOverview({ data }: DashboardOverviewProps) {
    return (
        <div className="space-y-6">
            <KpiCards stats={data.stats} />
            <ChartsSection dailyData={data.dailyData} sourceData={data.sourceData} />
            <RecentActivity
                specialtyData={data.specialtyData}
                recentLeads={data.recentLeads}
                recentAppointments={data.recentAppointments}
            />
        </div>
    );
}
