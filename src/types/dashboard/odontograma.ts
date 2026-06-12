export type ToothStatus =
    | "HEALTHY"
    | "CAVITY"
    | "ENDODONTICS"
    | "PROSTHESIS"
    | "IMPLANT"
    | "EXTRACTED"
    | "RETAINED"
    | "OTHER";

export interface ITooth {
    id?: string;
    odontogramId?: string;
    toothKey: string;
    isCustom: boolean;
    customName?: string | null;
    status: ToothStatus;
    notes?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IOdontogram {
    id?: string;
    patientId?: string;
    teeth: ITooth[];
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CustomTooth {
    id: string;
    description: string;
    status: ToothStatus;
    notes: string;
}
