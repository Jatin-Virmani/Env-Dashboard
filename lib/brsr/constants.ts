/**
 * BRSR (Business Responsibility & Sustainability Reporting) – SEBI framework.
 * Tabs and principle-wise indicator mapping per Annexure I.
 */

export const BRSR_TABS = [
  "Air",
  "Water",
  "Land",
  "Waste",
  "Energy",
  "Workforce",
  "Governance",
  "Supply Chain",
  "Community",
] as const;

export type BRSRTabId = (typeof BRSR_TABS)[number];

/** Principle 6 – Environment: Air */
export const AIR_INDICATORS = [
  { id: "6.5", label: "Air emissions (NOx, SOx, PM, POP, VOC, HAP)", unit: "specify unit", principle: 6 },
  { id: "6.6", label: "Greenhouse gas Scope 1 & 2", unit: "tCO2e", principle: 6 },
  { id: "6.7", label: "Projects reducing GHG emissions", principle: 6 },
];

/** Principle 6 – Environment: Water */
export const WATER_INDICATORS = [
  { id: "6.3", label: "Water withdrawal by source (surface, groundwater, third party, etc.)", unit: "kL", principle: 6 },
  { id: "6.3b", label: "Water consumption & intensity", unit: "kL / ₹ turnover", principle: 6 },
  { id: "6.4", label: "Zero Liquid Discharge (ZLD)", principle: 6 },
];

/** Principle 6 – Land / biodiversity */
export const LAND_INDICATORS = [
  { id: "6.10", label: "Operations in ecologically sensitive areas", principle: 6 },
  { id: "6.11", label: "Environmental impact assessments (EIA)", principle: 6 },
  { id: "6.12", label: "Compliance with environmental laws (Water, Air, EPA)", principle: 6 },
];

/** Principle 6 – Waste; Principle 2 – EPR, reclaim */
export const WASTE_INDICATORS = [
  { id: "6.8", label: "Waste generated (plastic, e-waste, bio-medical, C&D, hazardous, etc.)", unit: "MT", principle: 6 },
  { id: "6.8b", label: "Waste recovered (recycled, re-used, other recovery)", unit: "MT", principle: 6 },
  { id: "6.8c", label: "Waste disposed (incineration, landfilling)", unit: "MT", principle: 6 },
  { id: "2.4", label: "Extended Producer Responsibility (EPR) plan", principle: 2 },
];

/** Principle 6 – Energy */
export const ENERGY_INDICATORS = [
  { id: "6.1", label: "Total energy consumption & intensity", unit: "Joules / ₹ turnover", principle: 6 },
  { id: "6.2", label: "PAT scheme (Designated Consumers) achievement", principle: 6 },
  { id: "6.1L", label: "Energy from renewable vs non-renewable", principle: 6 },
];

/** Principle 3 – Well-being; Principle 5 – Human rights */
export const WORKFORCE_INDICATORS = [
  { id: "3.1", label: "Well-being (health, accident, maternity, paternity, day care)", principle: 3 },
  { id: "3.11", label: "Safety incidents (LTIFR, recordable injuries, fatalities)", principle: 3 },
  { id: "5.2", label: "Minimum wages (equal / more than minimum wage)", principle: 5 },
  { id: "5.3", label: "Remuneration (BoD, KMP, employees, workers)", principle: 5 },
  { id: "3.8", label: "Training (health & safety, skill upgradation)", principle: 3 },
];

/** Principle 1 – Ethics; Section B – Policies, board oversight */
export const GOVERNANCE_INDICATORS = [
  { id: "1.2", label: "Fines/penalties with regulators (monetary & non-monetary)", principle: 1 },
  { id: "1.4", label: "Anti-corruption / anti-bribery policy", principle: 1 },
  { id: "1.6", label: "Conflict of interest complaints", principle: 1 },
  { id: "B.1", label: "Policy coverage of NGRBC principles & board approval", principle: 0 },
  { id: "B.9", label: "Committee of Board for sustainability", principle: 0 },
];

/** Principle 2/3/5/6 value chain; Principle 8 – MSME, local sourcing */
export const SUPPLY_CHAIN_INDICATORS = [
  { id: "2.2", label: "Sustainable sourcing (% inputs sourced sustainably)", principle: 2 },
  { id: "8.4", label: "Input from MSMEs / small producers; local (district/neighbouring)", principle: 8 },
  { id: "3.6L", label: "Value chain partners – health & safety assessment %", principle: 3 },
];

/** Principle 4 – Stakeholders; Principle 8 – SIA, R&R, CSR; Principle 9 – Consumers */
export const COMMUNITY_INDICATORS = [
  { id: "4.1", label: "Stakeholder identification & engagement", principle: 4 },
  { id: "8.1", label: "Social Impact Assessments (SIA)", principle: 8 },
  { id: "8.2", label: "Rehabilitation & Resettlement (R&R)", principle: 8 },
  { id: "9.1", label: "Consumer complaints & feedback mechanism", principle: 9 },
  { id: "9.3", label: "Consumer complaints (data privacy, advertising, cyber-security, etc.)", principle: 9 },
];

export const TAB_INDICATORS: Record<BRSRTabId, { id: string; label: string; unit?: string; principle: number }[]> = {
  Air: AIR_INDICATORS,
  Water: WATER_INDICATORS,
  Land: LAND_INDICATORS,
  Waste: WASTE_INDICATORS,
  Energy: ENERGY_INDICATORS,
  Workforce: WORKFORCE_INDICATORS,
  Governance: GOVERNANCE_INDICATORS,
  "Supply Chain": SUPPLY_CHAIN_INDICATORS,
  Community: COMMUNITY_INDICATORS,
};

export const NGRBC_PRINCIPLES = [
  "P1: Ethical, Transparent, Accountable",
  "P2: Sustainable & Safe goods/services",
  "P3: Well-being of employees & value chain",
  "P4: Responsive to stakeholders",
  "P5: Respect & promote human rights",
  "P6: Protect & restore environment",
  "P7: Responsible public & regulatory policy",
  "P8: Inclusive growth & equitable development",
  "P9: Value to consumers responsibly",
] as const;
