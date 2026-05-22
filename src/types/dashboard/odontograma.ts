export type ToothStatus =
    | "SAUDAVEL"
    | "CARIE"
    | "ENDODONTIA"
    | "PROTESE"
    | "IMPLANTE"
    | "EXTRAIDO"
    | "RETIDO"
    | "OUTRO";

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
