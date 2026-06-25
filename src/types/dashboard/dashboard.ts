export interface DashboardStats {
    totalLeads: number;
    leadsTrend: number;
    totalAppointments: number;
    appointmentsTrend: number;
    totalPatients: number;
    conversionRate: number;
}

export interface DashboardDailyData {
    date: string;
    leads: number;
    confirmed: number;
    completed: number;
    pending: number;
    cancelled: number;
}

export interface DashboardSourceData {
    name: string;
    value: number;
}

export interface DashboardSpecialtyData {
    name: string;
    value: number;
}

export interface DashboardRecentLead {
    id: string;
    name: string;
    phone: string;
    serviceType: string;
    status: string;
    utmSource: string | null;
    createdAt: string;
}

export interface DashboardRecentAppointment {
    id: string;
    patientName: string;
    serviceType: string;
    scheduledAt: string;
    status: string;
}

export interface DashboardResponse {
    stats: DashboardStats;
    dailyData: DashboardDailyData[];
    sourceData: DashboardSourceData[];
    specialtyData: DashboardSpecialtyData[];
    recentLeads: DashboardRecentLead[];
    recentAppointments: DashboardRecentAppointment[];
}

export interface KpiCardsProps {
    stats: DashboardStats;
}

export interface DashboardOverviewProps {
    data: DashboardResponse;
}

export interface ChartsSectionProps {
    dailyData: DashboardDailyData[];
    sourceData: DashboardSourceData[];
}

export interface RecentActivityProps {
    specialtyData: DashboardSpecialtyData[];
    recentLeads: DashboardRecentLead[];
    recentAppointments: DashboardRecentAppointment[];
}
