import { z } from 'zod';

const arabicText = z.string().trim().min(1, 'النص مطلوب').refine((value) => /[\p{Script=Arabic}]/u.test(value), 'يجب أن يتضمن النص حروفاً عربية');
const nonEmptyText = z.string().trim().min(1, 'القيمة لا يجوز أن تكون فارغة');

export const rawContentSchema = z.object({
  unit_metadata: z.object({
    unit_id: nonEmptyText,
    unit_number: z.number().int().positive(),
    unit_title: arabicText,
    subject: arabicText,
    source_curriculum: nonEmptyText.optional(),
    studio_artifacts_integrated: z.array(nonEmptyText).optional(),
  }),
  full_unit_text: z.object({
    title: arabicText,
    section_1_concepts_and_causes: z.object({
      title: arabicText,
      '1_definition_inhiraf': arabicText,
      '2_definition_crime': arabicText,
      '3_causes_of_crime': z.array(arabicText).min(1),
    }),
    section_2_preventive_method: z.object({
      title: arabicText,
      description: arabicText,
      means_1_strengthening_faith: z.object({ title: arabicText, explanation: arabicText, proof: arabicText }),
      means_2_worship_and_ethics: z.object({ title: arabicText, explanation: arabicText, proof: arabicText }),
    }),
    section_3_curative_method_penalties: z.object({
      title: arabicText,
      definition_penalty: arabicText,
      types_of_penalties: z.array(z.object({
        category: arabicText,
        definition: arabicText,
        crimes_and_details: z.array(z.object({
          crime: arabicText,
          penalty: arabicText,
          purpose: arabicText,
        })).min(1),
      })).min(1),
    }),
    section_4_characteristics_and_wisdoms: z.object({
      title: arabicText,
      characteristics: z.array(arabicText).min(1),
      wisdoms: z.array(arabicText).min(1),
    }),
  }),
  mind_map: z.object({
    root: arabicText,
    branches: z.array(z.object({
      title: arabicText,
      sub_items: z.array(arabicText).min(1),
    })).min(1),
  }),
  quiz: z.array(z.object({
    id: z.union([z.string().trim().min(1), z.number().int()]),
    question: arabicText,
    options: z.array(arabicText).min(4),
    correct_answer: arabicText,
    hint: arabicText,
    explanation: arabicText,
    bloom_level: nonEmptyText.optional(),
    category: arabicText.optional(),
  })).min(1),
  flashcards: z.array(z.object({
    card_id: nonEmptyText,
    front: arabicText,
    back: arabicText,
    category: arabicText.optional(),
  })).min(1),
  bac_and_predicted_questions: z.object({
    bac_archive_official: z.array(z.object({
      year: nonEmptyText.optional(),
      topic: arabicText,
      question: arabicText,
      model_answer: arabicText,
    })),
    predicted_practice_tables: z.object({
      comparison_table_penalties: z.object({
        headers: z.array(arabicText).min(2),
        rows: z.array(z.array(arabicText).min(2)).min(1),
      }),
    }),
  }),
});

export type RawUnitContent = z.infer<typeof rawContentSchema>;
