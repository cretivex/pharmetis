/**
 * Shared surface styles for medicine listing cards (MedicinesProductGrid) and
 * detail page panels — keep border, shadow, and ring in sync.
 */
export const medicineCardSurfaceClass =
  'rounded-xl border border-slate-300/95 bg-white shadow-[0_2px_8px_rgba(5,11,29,0.06),0_8px_24px_-6px_rgba(5,11,29,0.1)] ring-1 ring-slate-900/[0.04]'

/** Hover affordance for interactive product cards (listing grid). */
export const medicineCardHoverClass =
  'transition duration-200 hover:border-slate-400/90 hover:shadow-[0_4px_16px_rgba(5,11,29,0.08),0_12px_32px_-8px_rgba(5,11,29,0.12)]'
