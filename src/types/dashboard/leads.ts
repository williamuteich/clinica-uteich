export interface Lead {
    id: string;
    name: string;
    phone: string;
    serviceType: string | null;
    observation: string | null;
    status: string;
    step: number;
    appointmentId: string | null;
    utmSource: string | null;
    utmMedium: string | null;
    utmCampaign: string | null;
    utmContent: string | null;
    utmTerm: string | null;
    conversionUrl: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface LeadStats {
    total: number;
    interested: number;
    converted: number;
    conversionRate: number;
}

export interface GetLeadsResponse {
    leads: Lead[];
    stats: LeadStats;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface LeadInput {
    name: string;
    phone: string;
    serviceType?: string | null;
    observation?: string | null;
    leadId?: string | null;
    gclid?: string | null;
    utmSource?: string | null;
    utmMedium?: string | null;
    utmCampaign?: string | null;
    utmContent?: string | null;
    utmTerm?: string | null;
    conversionUrl?: string | null;
}
