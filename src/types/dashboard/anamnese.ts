export interface IPatient {
    id: string;
    name: string;
    cpf: string;
    birthDate: Date;
    phone: string;
    zipCode: string;
    state: string;
    city: string;
    street: string;
    number: string;
    complement?: string;

    active: boolean;

    createdAt: Date;
    updatedAt: Date;

    history?: IPatientHistory[];
    anamneses?: IAnamnese[];
}

export interface AnamneseTabProps {
    patientId: string;
    initialAnamnese?: IAnamnese | null;
}

export interface IPatientHistory {
    id: string;
    patientId: string;
    description: string;

    createdAt: Date;
    updatedAt: Date;
}

export interface IAnamnese {
    id: string;
    patientId: string;
    observations?: string;
    doctorRecommendations?: string;
    panicOrBehaviorNotes?: string;
    requiresMedicalClearance: boolean;
    diseases?: IAnamneseDisease[];
    allergies?: IAnamneseAllergy[];
    medications?: IContinuousMedication[];

    createdAt: Date;
    updatedAt: Date;
}

export interface IAnamneseDisease {
    id: string;
    anamneseId: string;
    name: string;
    observations?: string;
}

export interface IAnamneseAllergy {
    id: string;
    anamneseId: string;
    substance: string;
    reaction?: string;
}

export interface IContinuousMedication {
    id: string;
    anamneseId: string;
    medication: string;
    dosage?: string;
    frequency?: string;
    medicalFollowUp?: string;
}