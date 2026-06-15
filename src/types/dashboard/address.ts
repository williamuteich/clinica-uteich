export interface AddressValues {
    zipCode: string;
    state: string;
    city: string;
    neighborhood?: string;
    street: string;
    number: string;
    complement: string;
}

export interface AddressFieldsProps {
    values: AddressValues;
    onChange: (updated: Partial<AddressValues>) => void;
    required?: boolean;
    className?: string;
}
