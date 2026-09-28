import { createTV } from "tailwind-variants";

import { TAILWIND_MERGE_CONFIG } from "./cn";

export type { VariantProps } from "tailwind-variants";

export const tv = createTV({ twMergeConfig: TAILWIND_MERGE_CONFIG });
