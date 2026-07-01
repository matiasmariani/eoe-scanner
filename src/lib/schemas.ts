import { z } from 'zod';

// --- Open Food Facts Schemas ---

export const OpenFoodFactsErrorSchema = z.object({
  message: z
    .object({
      id: z.string().optional(),
      name: z.string().optional(),
      lc_name: z.string().optional(),
      description: z.string().optional(),
      lc_description: z.string().optional(),
    })
    .optional(),
  field: z
    .object({
      id: z.string().optional(),
      value: z.string().optional(),
    })
    .optional(),
  impact: z
    .object({
      id: z.string().optional(),
      name: z.string().optional(),
      lc_name: z.string().optional(),
      description: z.string().optional(),
      lc_description: z.string().optional(),
    })
    .optional(),
});

export const OpenFoodFactsProductSchema = z.object({
  product_name: z.string().optional(),
  brands: z.string().optional(),
  ingredients_text: z.string().optional(),
  allergens: z.string().optional(),
  allergens_tags: z.array(z.string()).optional(),
  image_url: z.string().url().optional().nullable(),
  image_front_url: z.string().url().optional().nullable(),
  image_small_url: z.string().url().optional().nullable(),
  categories_tags: z.array(z.string()).optional(),
});

export const OpenFoodFactsResponseSchema = z.object({
  status: z.enum(['success', 'failure']),
  result: z
    .object({
      name: z.string().optional(),
    })
    .optional(),
  product: OpenFoodFactsProductSchema.optional(),
  errors: z.array(OpenFoodFactsErrorSchema).optional(),
  warnings: z.array(OpenFoodFactsErrorSchema).optional(),
});

// --- USDA Schemas ---

export const USDAFoodNutrientSchema = z.object({
  nutrientId: z.number(),
  nutrientName: z.string(),
  nutrientNumber: z.string(),
  unitName: z.string(),
  derivationCode: z.string(),
  derivationDescription: z.string(),
  derivationId: z.number(),
  value: z.number(),
  foodNutrientSourceId: z.number(),
  foodNutrientSourceCode: z.string(),
  foodNutrientSourceDescription: z.string(),
  rank: z.number(),
  indentLevel: z.number(),
  foodNutrientId: z.number(),
});

export const USDAFoodSchema = z.object({
  fdcId: z.number(),
  description: z.string(),
  lowercaseDescription: z.string(),
  dataType: z.string(),
  gtinUpc: z.string().optional(),
  publishedDate: z.string().optional(),
  brandOwner: z.string().optional(),
  brandName: z.string().optional(),
  ingredients: z.string().optional(),
  marketCountry: z.string().optional(),
  foodCategory: z.string().optional(),
  modifiedDate: z.string().optional(),
  dataSource: z.string().optional(),
  packageWeight: z.string().optional(),
  servingSizeUnit: z.string().optional(),
  servingSize: z.number().optional(),
  tradeChannels: z.array(z.string()).optional(),
  allHighlightFields: z.string().optional(),
  score: z.number().optional(),
  foodNutrients: z.array(USDAFoodNutrientSchema).optional(),
  foundAllergens: z.array(z.string()).optional(),
});

export const USDAFoodSearchResponseSchema = z.object({
  totalHits: z.number(),
  currentPage: z.number(),
  totalPages: z.number(),
  pageList: z.array(z.number()),
  foodSearchCriteria: z.record(z.string(), z.any()),
  foods: z.array(USDAFoodSchema),
});

export const USDAErrorResponseSchema = z.object({
  error: z
    .object({
      code: z.string().optional(),
      message: z.string().optional(),
    })
    .optional(),
  timestamp: z.string().optional(),
  status: z.number().optional(),
  message: z.string().optional(),
  path: z.string().optional(),
});
