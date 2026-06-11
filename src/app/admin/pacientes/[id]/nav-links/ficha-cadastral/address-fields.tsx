"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { maskCEP } from "@/src/lib/masks";
import { fetchCep } from "@/src/lib/cep";
import { AddressValues, AddressFieldsProps } from "@/src/types/dashboard/address";

export type { AddressValues };

export function AddressFields({ values, onChange, required = true, className }: AddressFieldsProps) {
    const [cepLoading, setCepLoading] = useState(false);

    const handleCepBlur = async () => {
        if (!values.zipCode) return;
        setCepLoading(true);
        const data = await fetchCep(values.zipCode);
        if (data) {
            onChange({
                state: data.uf || "",
                city: data.localidade || "",
                street: data.logradouro || "",
            });
        }
        setCepLoading(false);
    };

    return (
        <div className={className}>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label htmlFor="zipCode" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        CEP
                    </Label>
                    <div className="relative">
                        <Input
                            id="zipCode"
                            name="zipCode"
                            value={values.zipCode}
                            onChange={(e) => onChange({ zipCode: maskCEP(e.target.value) })}
                            onBlur={handleCepBlur}
                            placeholder="00000-000"
                            required={required}
                            maxLength={9}
                            className="h-10 bg-white pr-9"
                        />
                        {cepLoading && (
                            <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-blue-500" />
                        )}
                    </div>
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="state" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Estado (UF)
                    </Label>
                    <Input
                        id="state"
                        name="state"
                        value={values.state}
                        onChange={(e) => onChange({ state: e.target.value })}
                        placeholder="RS"
                        required={required}
                        maxLength={2}
                        className="h-10 bg-white"
                    />
                </div>

                <div className="col-span-2 space-y-1.5">
                    <Label htmlFor="city" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Cidade
                    </Label>
                    <Input
                        id="city"
                        name="city"
                        value={values.city}
                        onChange={(e) => onChange({ city: e.target.value })}
                        placeholder="Porto Alegre"
                        required={required}
                        className="h-10 bg-white"
                    />
                </div>

                <div className="col-span-2 space-y-1.5">
                    <Label htmlFor="street" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Rua / Logradouro
                    </Label>
                    <Input
                        id="street"
                        name="street"
                        value={values.street}
                        onChange={(e) => onChange({ street: e.target.value })}
                        placeholder="Rua das Flores"
                        required={required}
                        className="h-10 bg-white"
                    />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="number" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Número
                    </Label>
                    <Input
                        id="number"
                        name="number"
                        value={values.number}
                        onChange={(e) => onChange({ number: e.target.value })}
                        placeholder="123"
                        required={required}
                        className="h-10 bg-white"
                    />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="complement" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Complemento
                    </Label>
                    <Input
                        id="complement"
                        name="complement"
                        value={values.complement}
                        onChange={(e) => onChange({ complement: e.target.value })}
                        placeholder="Apto 2B"
                        className="h-10 bg-white"
                    />
                </div>
            </div>
        </div>
    );
}
