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
    createdAt: string;
    updatedAt: string;
}

export interface LeadStats {
    total: number;
    interested: number;
    converted: number;
    conversionRate: number;
}
