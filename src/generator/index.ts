import { templateGenerator } from './templateGenerator'
import type { BriefGenerator } from './types'

// MVP: use template generator
// Future: swap with geminiGenerator
export const generator: BriefGenerator = templateGenerator
