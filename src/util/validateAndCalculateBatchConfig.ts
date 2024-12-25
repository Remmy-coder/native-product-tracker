import { z } from "zod";

interface BatchCalculationResult {
  isValid: boolean;
  calculatedValues: {
    packsPerBox: number;
    unitsPerBox: number;
    totalPacks: number;
    totalUnits: number;
  };
  errors: string[];
}


export function validateAndCalculateBatchConfig(input: {
  packagesConfiguration: string;
  boxes?: number;
  unitsPerPack?: number;
}): BatchCalculationResult {
  const boxes = input.boxes || 0;
  const unitsPerPack = input.unitsPerPack || 0;

  const configParts = input.packagesConfiguration
    .split('x')
    .map(part => part.trim());

  const errors: string[] = [];
  let calculatedValues = {
    packsPerBox: 0,
    unitsPerBox: 0,
    totalPacks: 0,
    totalUnits: 0
  };

  if (configParts.length !== 4) {
    errors.push("Package configuration must be in format: 'layers x rows x packs x units'");
    return {
      isValid: false,
      calculatedValues,
      errors
    };
  }

  const [layers, rowsPerLayer, packsPerRow, configUnitsPerPack] = configParts.map(part => {
    const parsed = parseInt(part, 10);
    if (isNaN(parsed) || parsed <= 0) {
      errors.push(`Invalid number in configuration: ${part}`);
      return 0;
    }
    return parsed;
  });

  if (errors.length > 0) {
    return {
      isValid: false,
      calculatedValues,
      errors
    };
  }

  const packsPerBox = layers * rowsPerLayer * packsPerRow;

  if (configUnitsPerPack !== unitsPerPack && unitsPerPack !== 1) {
    errors.push(`Units per pack mismatch: Configuration shows ${configUnitsPerPack}, but form has ${unitsPerPack}`);
  }

  const unitsPerBox = packsPerBox * unitsPerPack;

  const totalPacks = packsPerBox * boxes;
  const totalUnits = unitsPerBox * boxes;

  calculatedValues = {
    packsPerBox,
    unitsPerBox,
    totalPacks,
    totalUnits
  };

  return {
    isValid: true,
    calculatedValues,
    errors
  };
}

export const extendedBatchSchema = z.object({
  batchNo: z
    .string({
      required_error: "Batch number is required",
      invalid_type_error: "Batch number must be a string",
    })
    .min(2, {
      message: "Batch number must be at least 2 characters.",
    }),
  mfgDate: z.date({
    required_error: "Manufactured date is required",
    invalid_type_error: "Manufactured date must be a valid date",
  }),
  expDate: z.date({
    required_error: "Expiration date is required",
    invalid_type_error: "Expiration date must be a date",
  }),
  packagesConfiguration: z.string()
    .refine((val) => {
      try {
        const result = validateAndCalculateBatchConfig({
          packagesConfiguration: val
        });
        return result.isValid;
      } catch {
        return false;
      }
    }, {
      message: "Invalid package configuration format"
    }),
  boxes: z
    .number({
      required_error: "Number of boxes is required",
      invalid_type_error: "Number of boxes must be a number",
    })
    .positive({ message: "Number of boxes be greater than 0" }), unitsPerPack: z.number().positive(),
  packsPerBox: z.number().optional(),
  unitsPerBox: z.number().optional(),
  totalPacks: z.number().optional(),
}).refine((data) => {
  const result = validateAndCalculateBatchConfig({
    packagesConfiguration: data.packagesConfiguration,
    boxes: data.boxes,
    unitsPerPack: data.unitsPerPack
  });
  return result.isValid;
}, {
  message: "Batch configuration validation failed",
  path: ["packagesConfiguration"]
});
