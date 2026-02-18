import { z } from 'zod';

// Schema de validação para os dados do app
export const appDataSchema = z.object({
  // Nome do app - permite letras, números, espaços, hífens, pontos, vírgulas, apóstrofos, acentos e símbolos comuns (™, ®, ©, etc.)
  appName: z.string()
    .trim()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),

  // Descrição do app - sem limite de caracteres
  appDescription: z.string()
    .trim()
    .optional(),

  // Cor do app (hex color)
  appColor: z.string()
    .regex(/^#[0-9A-F]{6}$/i, 'Cor inválida. Use formato HEX (#RRGGBB)'),

  // Link personalizado (slug)
  customLink: z.string()
    .trim()
    .regex(/^[a-z0-9-]*$/, 'Link personalizado: apenas letras minúsculas, números e hífens')
    .min(0)
    .max(50, 'Link deve ter no máximo 50 caracteres')
    .optional()
    .or(z.literal('')),

  // Domínio personalizado
  customDomain: z.string()
    .trim()
    .max(100, 'Domínio deve ter no máximo 100 caracteres')
    .optional()
    .or(z.literal('')),

  // Labels personalizáveis
  mainProductLabel: z.string()
    .trim()
    .max(50, 'Label deve ter no máximo 50 caracteres'),

  // Descrição do produto principal - sem limite de caracteres
  mainProductDescription: z.string()
    .trim()
    .optional(),

  bonusesLabel: z.string()
    .trim()
    .max(50, 'Label deve ter no máximo 50 caracteres'),

  // Labels dos bônus individuais (1-9)
  bonus1Label: z.string().trim().max(50).optional(),
  bonus2Label: z.string().trim().max(50).optional(),
  bonus3Label: z.string().trim().max(50).optional(),
  bonus4Label: z.string().trim().max(50).optional(),
  bonus5Label: z.string().trim().max(50).optional(),
  bonus6Label: z.string().trim().max(50).optional(),
  bonus7Label: z.string().trim().max(50).optional(),
  bonus8Label: z.string().trim().max(50).optional(),
  bonus9Label: z.string().trim().max(50).optional(),
  
  // Label do botão de visualização
  viewButtonLabel: z.string()
    .trim()
    .max(20, 'Label do botão deve ter no máximo 20 caracteres')
    .optional(),
});

// Tipo TypeScript inferido do schema
export type AppDataValidation = z.infer<typeof appDataSchema>;

// Schema para validação de upload de arquivo
export const fileUploadSchema = z.object({
  type: z.enum(['image/png', 'image/jpeg', 'image/jpg', 'application/pdf', 'audio/mpeg', 'audio/mp3']),
  size: z.number().max(100 * 1024 * 1024),
  name: z.string().max(255, 'Nome do arquivo muito longo'),
});

// Validação específica para PDFs
export const pdfValidationSchema = fileUploadSchema.extend({
  type: z.literal('application/pdf'),
  size: z.number().max(100 * 1024 * 1024),
});

// Validação específica para MP3s
export const mp3ValidationSchema = fileUploadSchema.extend({
  type: z.enum(['audio/mpeg', 'audio/mp3']),
  size: z.number().max(100 * 1024 * 1024),
});

// Validação específica para imagens
export const imageValidationSchema = fileUploadSchema.extend({
  type: z.enum(['image/png', 'image/jpeg', 'image/jpg']),
  size: z.number().max(10 * 1024 * 1024),
});
