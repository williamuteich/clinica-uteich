import { z } from "zod";

/* =========================================================
 * BASES
 * =======================================================*/

const baseEntitySchema = z.object({
    id: z.string().optional(),

    createdAt: z.date().optional(),

    updatedAt: z.date().optional(),
});

const relationSchema = z.object({
    patientId: z.string().optional(),

    anamneseId: z.string().optional(),
});

/* =========================================================
 * DISEASE
 * =======================================================*/

export const anamneseDiseaseSchema =
    baseEntitySchema.merge(
        relationSchema.pick({
            anamneseId: true,
        })
    ).extend({
        name: z
            .string()
            .min(1, "Nome da doença obrigatório"),

        observations: z
            .string()
            .optional(),
    });

export type IAnamneseDisease =
    z.infer<typeof anamneseDiseaseSchema>;

/* =========================================================
 * ALLERGY
 * =======================================================*/

export const anamneseAllergySchema =
    baseEntitySchema.merge(
        relationSchema.pick({
            anamneseId: true,
        })
    ).extend({
        substance: z
            .string()
            .min(1, "Substância obrigatória"),

        reaction: z
            .string()
            .optional(),
    });

export type IAnamneseAllergy =
    z.infer<typeof anamneseAllergySchema>;

/* =========================================================
 * MEDICATION
 * =======================================================*/

export const continuousMedicationSchema =
    baseEntitySchema.merge(
        relationSchema.pick({
            anamneseId: true,
        })
    ).extend({
        medication: z
            .string()
            .min(1, "Medicamento obrigatório"),

        dosage: z
            .string()
            .optional(),

        frequency: z
            .string()
            .optional(),

        medicalFollowUp: z
            .string()
            .optional(),
    });

export type IContinuousMedication =
    z.infer<typeof continuousMedicationSchema>;

/* =========================================================
 * ANAMNESE
 * =======================================================*/

export const anamneseSchema =
    baseEntitySchema.merge(
        relationSchema.pick({
            patientId: true,
        })
    ).extend({
        observations: z
            .string()
            .optional(),

        doctorRecommendations: z
            .string()
            .optional(),

        panicOrBehaviorNotes: z
            .string()
            .optional(),

        requiresMedicalClearance: z
            .boolean()
            .default(false),

        diseases: z.array(
            anamneseDiseaseSchema
        ),

        allergies: z.array(
            anamneseAllergySchema
        ),

        medications: z.array(
            continuousMedicationSchema
        ),
    });

export type IAnamnese =
    z.infer<typeof anamneseSchema>;

/* =========================================================
 * PATIENT HISTORY
 * =======================================================*/

export const patientHistorySchema =
    baseEntitySchema.merge(
        relationSchema.pick({
            patientId: true,
        })
    ).extend({
        description: z
            .string()
            .min(1, "Descrição obrigatória"),
    });

export type IPatientHistory =
    z.infer<typeof patientHistorySchema>;

/* =========================================================
 * PATIENT
 * =======================================================*/

export const patientSchema =
    baseEntitySchema.extend({
        name: z
            .string()
            .min(3, "Nome obrigatório"),

        cpf: z
            .string()
            .min(11, "CPF inválido"),

        birthDate: z.date(),

        phone: z
            .string()
            .min(8, "Telefone inválido"),

        zipCode: z.string(),

        state: z.string(),

        city: z.string(),

        street: z.string(),

        number: z.string(),

        complement: z
            .string()
            .optional(),

        active: z
            .boolean()
            .default(true),

        history: z
            .array(patientHistorySchema)
            .optional(),

        anamneses: z
            .array(anamneseSchema)
            .optional(),
    });

export type IPatient =
    z.infer<typeof patientSchema>;