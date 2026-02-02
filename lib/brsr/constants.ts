/**
 * BRSR (Business Responsibility & Sustainability Reporting) – SEBI framework.
 * Tabs and principle-wise indicator mapping per Annexure I.
 */

export const BRSR_TABS = [
  "General Disclosures",
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
  { id: "6.5", label: "Air emissions (NOx, SOx, PM, POP, VOC, HAP)", unit: "tonnes", principle: 6 },
  { id: "6.5a", label: "NOx emissions", unit: "tonnes", principle: 6 },
  { id: "6.5b", label: "SOx emissions", unit: "tonnes", principle: 6 },
  { id: "6.5c", label: "Particulate Matter (PM) emissions", unit: "tonnes", principle: 6 },
  { id: "6.5d", label: "Volatile Organic Compounds (VOC) emissions", unit: "tonnes", principle: 6 },
  { id: "6.6", label: "Greenhouse gas Scope 1 & 2", unit: "tCO2e", principle: 6 },
  { id: "6.6a", label: "Scope 1 GHG emissions", unit: "tCO2e", principle: 6 },
  { id: "6.6b", label: "Scope 2 GHG emissions", unit: "tCO2e", principle: 6 },
  { id: "6.6c", label: "Scope 3 GHG emissions (if applicable)", unit: "tCO2e", principle: 6 },
  { id: "6.7", label: "Projects reducing GHG emissions", principle: 6 },
  { id: "6.7a", label: "Number of GHG reduction projects", principle: 6 },
  { id: "6.7b", label: "Total GHG reduction achieved", unit: "tCO2e", principle: 6 },
];

/** Principle 6 – Environment: Water */
export const WATER_INDICATORS = [
  { id: "6.3", label: "Water withdrawal by source (surface, groundwater, third party, etc.)", unit: "kL", principle: 6 },
  { id: "6.3a", label: "Surface water withdrawal", unit: "kL", principle: 6 },
  { id: "6.3b", label: "Groundwater withdrawal", unit: "kL", principle: 6 },
  { id: "6.3c", label: "Third-party water withdrawal", unit: "kL", principle: 6 },
  { id: "6.3d", label: "Total water withdrawal", unit: "kL", principle: 6 },
  { id: "6.3e", label: "Water consumption & intensity", unit: "kL / ₹ turnover", principle: 6 },
  { id: "6.3f", label: "Water recycled/reused", unit: "kL", principle: 6 },
  { id: "6.4", label: "Zero Liquid Discharge (ZLD)", principle: 6 },
  { id: "6.4a", label: "ZLD facilities count", principle: 6 },
  { id: "6.4b", label: "Water discharge (treated/untreated)", unit: "kL", principle: 6 },
];

/** Principle 6 – Land / biodiversity */
export const LAND_INDICATORS = [
  { id: "6.10", label: "Operations in ecologically sensitive areas", principle: 6 },
  { id: "6.10a", label: "Number of facilities in ecologically sensitive areas", principle: 6 },
  { id: "6.10b", label: "Area under operations in sensitive zones", unit: "hectares", principle: 6 },
  { id: "6.11", label: "Environmental impact assessments (EIA)", principle: 6 },
  { id: "6.11a", label: "Number of EIA studies conducted", principle: 6 },
  { id: "6.11b", label: "EIA compliance status", principle: 6 },
  { id: "6.12", label: "Compliance with environmental laws (Water, Air, EPA)", principle: 6 },
  { id: "6.12a", label: "Environmental compliance violations", principle: 6 },
  { id: "6.12b", label: "Fines/penalties for environmental non-compliance", unit: "₹", principle: 6 },
  { id: "6.13", label: "Biodiversity conservation initiatives", principle: 6 },
  { id: "6.13a", label: "Area under biodiversity conservation", unit: "hectares", principle: 6 },
];

/** Principle 6 – Waste; Principle 2 – EPR, reclaim */
export const WASTE_INDICATORS = [
  { id: "6.8", label: "Waste generated (plastic, e-waste, bio-medical, C&D, hazardous, etc.)", unit: "MT", principle: 6 },
  { id: "6.8a", label: "Plastic waste generated", unit: "MT", principle: 6 },
  { id: "6.8b", label: "E-waste generated", unit: "MT", principle: 6 },
  { id: "6.8c", label: "Hazardous waste generated", unit: "MT", principle: 6 },
  { id: "6.8d", label: "Construction & Demolition waste generated", unit: "MT", principle: 6 },
  { id: "6.8e", label: "Biomedical waste generated", unit: "MT", principle: 6 },
  { id: "6.8f", label: "Total waste generated", unit: "MT", principle: 6 },
  { id: "6.9", label: "Waste recovered (recycled, re-used, other recovery)", unit: "MT", principle: 6 },
  { id: "6.9a", label: "Waste recycled", unit: "MT", principle: 6 },
  { id: "6.9b", label: "Waste reused", unit: "MT", principle: 6 },
  { id: "6.9c", label: "Waste recovery rate", unit: "%", principle: 6 },
  { id: "6.9d", label: "Waste disposed (incineration, landfilling)", unit: "MT", principle: 6 },
  { id: "2.4", label: "Extended Producer Responsibility (EPR) plan", principle: 2 },
  { id: "2.4a", label: "EPR registration status", principle: 2 },
  { id: "2.4b", label: "EPR targets achieved", unit: "%", principle: 2 },
];

/** Principle 6 – Energy */
export const ENERGY_INDICATORS = [
  { id: "6.1", label: "Total energy consumption & intensity", unit: "GJ / ₹ turnover", principle: 6 },
  { id: "6.1a", label: "Total energy consumption", unit: "GJ", principle: 6 },
  { id: "6.1b", label: "Energy intensity", unit: "GJ / ₹ turnover", principle: 6 },
  { id: "6.1L", label: "Energy from renewable vs non-renewable", principle: 6 },
  { id: "6.1La", label: "Renewable energy consumption", unit: "GJ", principle: 6 },
  { id: "6.1Lb", label: "Non-renewable energy consumption", unit: "GJ", principle: 6 },
  { id: "6.1Lc", label: "Renewable energy percentage", unit: "%", principle: 6 },
  { id: "6.2", label: "PAT scheme (Designated Consumers) achievement", principle: 6 },
  { id: "6.2a", label: "PAT target", unit: "Mtoe", principle: 6 },
  { id: "6.2b", label: "PAT achievement", unit: "Mtoe", principle: 6 },
  { id: "6.2c", label: "PAT achievement percentage", unit: "%", principle: 6 },
];

/** Principle 3 – Well-being; Principle 5 – Human rights */
export const WORKFORCE_INDICATORS = [
  { id: "3.1", label: "Well-being (health, accident, maternity, paternity, day care)", principle: 3 },
  { id: "3.1a", label: "Health insurance coverage", unit: "%", principle: 3 },
  { id: "3.1b", label: "Maternity/paternity leave beneficiaries", principle: 3 },
  { id: "3.1c", label: "Day care facilities available", principle: 3 },
  { id: "3.11", label: "Safety incidents (LTIFR, recordable injuries, fatalities)", principle: 3 },
  { id: "3.11a", label: "Lost Time Injury Frequency Rate (LTIFR)", unit: "per million hours", principle: 3 },
  { id: "3.11b", label: "Total recordable injuries", principle: 3 },
  { id: "3.11c", label: "Fatalities", principle: 3 },
  { id: "3.11d", label: "Near-miss incidents", principle: 3 },
  { id: "5.2", label: "Minimum wages (equal / more than minimum wage)", principle: 5 },
  { id: "5.2a", label: "Workers paid at or above minimum wage", unit: "%", principle: 5 },
  { id: "5.3", label: "Remuneration (BoD, KMP, employees, workers)", principle: 5 },
  { id: "5.3a", label: "Average remuneration ratio (highest to lowest)", principle: 5 },
  { id: "3.8", label: "Training (health & safety, skill upgradation)", principle: 3 },
  { id: "3.8a", label: "Employees trained in health & safety", unit: "%", principle: 3 },
  { id: "3.8b", label: "Total training hours", unit: "hours", principle: 3 },
  { id: "3.8c", label: "Skill upgradation programs conducted", principle: 3 },
  { id: "3.9", label: "Employee diversity & inclusion", principle: 3 },
  { id: "3.9a", label: "Women in workforce", unit: "%", principle: 3 },
  { id: "3.9b", label: "Women in leadership positions", unit: "%", principle: 3 },
];

/** Principle 1 – Ethics; Section B – Policies, board oversight */
export const GOVERNANCE_INDICATORS = [
  { id: "1.2", label: "Fines/penalties with regulators (monetary & non-monetary)", principle: 1 },
  { id: "1.2a", label: "Monetary fines/penalties", unit: "₹", principle: 1 },
  { id: "1.2b", label: "Non-monetary penalties", principle: 1 },
  { id: "1.4", label: "Anti-corruption / anti-bribery policy", principle: 1 },
  { id: "1.4a", label: "Anti-corruption policy in place", principle: 1 },
  { id: "1.4b", label: "Corruption cases reported", principle: 1 },
  { id: "1.6", label: "Conflict of interest complaints", principle: 1 },
  { id: "1.6a", label: "Conflict of interest complaints received", principle: 1 },
  { id: "1.6b", label: "Conflict of interest complaints resolved", principle: 1 },
  { id: "B.1", label: "Policy coverage of NGRBC principles & board approval", principle: 0 },
  { id: "B.1a", label: "Number of NGRBC principles covered by policies", principle: 0 },
  { id: "B.9", label: "Committee of Board for sustainability", principle: 0 },
  { id: "B.9a", label: "Sustainability committee exists", principle: 0 },
  { id: "B.9b", label: "Sustainability committee meetings held", principle: 0 },
  { id: "1.7", label: "Whistleblower mechanism", principle: 1 },
  { id: "1.7a", label: "Whistleblower complaints received", principle: 1 },
  { id: "1.7b", label: "Whistleblower complaints resolved", principle: 1 },
];

/** Principle 2/3/5/6 value chain; Principle 8 – MSME, local sourcing */
export const SUPPLY_CHAIN_INDICATORS = [
  { id: "2.2", label: "Sustainable sourcing (% inputs sourced sustainably)", principle: 2 },
  { id: "2.2a", label: "Percentage of inputs sourced sustainably", unit: "%", principle: 2 },
  { id: "2.2b", label: "Sustainable sourcing value", unit: "₹", principle: 2 },
  { id: "8.4", label: "Input from MSMEs / small producers; local (district/neighbouring)", principle: 8 },
  { id: "8.4a", label: "Procurement from MSMEs", unit: "%", principle: 8 },
  { id: "8.4b", label: "Procurement from local suppliers", unit: "%", principle: 8 },
  { id: "8.4c", label: "MSME procurement value", unit: "₹", principle: 8 },
  { id: "3.6L", label: "Value chain partners – health & safety assessment %", principle: 3 },
  { id: "3.6La", label: "Value chain partners assessed for H&S", unit: "%", principle: 3 },
  { id: "2.3", label: "Supplier code of conduct", principle: 2 },
  { id: "2.3a", label: "Suppliers covered by code of conduct", unit: "%", principle: 2 },
  { id: "5.4", label: "Human rights in value chain", principle: 5 },
  { id: "5.4a", label: "Value chain partners assessed for human rights", unit: "%", principle: 5 },
];

/** Principle 4 – Stakeholders; Principle 8 – SIA, R&R, CSR; Principle 9 – Consumers */
export const COMMUNITY_INDICATORS = [
  { id: "4.1", label: "Stakeholder identification & engagement", principle: 4 },
  { id: "4.1a", label: "Number of stakeholder groups identified", principle: 4 },
  { id: "4.1b", label: "Stakeholder engagement sessions conducted", principle: 4 },
  { id: "8.1", label: "Social Impact Assessments (SIA)", principle: 8 },
  { id: "8.1a", label: "SIA studies conducted", principle: 8 },
  { id: "8.1b", label: "SIA recommendations implemented", unit: "%", principle: 8 },
  { id: "8.2", label: "Rehabilitation & Resettlement (R&R)", principle: 8 },
  { id: "8.2a", label: "Families rehabilitated", principle: 8 },
  { id: "8.2b", label: "R&R expenditure", unit: "₹", principle: 8 },
  { id: "8.3", label: "Corporate Social Responsibility (CSR)", principle: 8 },
  { id: "8.3a", label: "CSR expenditure", unit: "₹", principle: 8 },
  { id: "8.3b", label: "CSR as % of average net profit", unit: "%", principle: 8 },
  { id: "8.3c", label: "CSR projects implemented", principle: 8 },
  { id: "9.1", label: "Consumer complaints & feedback mechanism", principle: 9 },
  { id: "9.1a", label: "Consumer complaints received", principle: 9 },
  { id: "9.1b", label: "Consumer complaints resolved", unit: "%", principle: 9 },
  { id: "9.3", label: "Consumer complaints (data privacy, advertising, cyber-security, etc.)", principle: 9 },
  { id: "9.3a", label: "Data privacy complaints", principle: 9 },
  { id: "9.3b", label: "Advertising-related complaints", principle: 9 },
  { id: "9.3c", label: "Cybersecurity incidents", principle: 9 },
  { id: "9.2", label: "Product safety & quality", principle: 9 },
  { id: "9.2a", label: "Product recalls", principle: 9 },
  { id: "9.2b", label: "Quality certifications obtained", principle: 9 },
];

/** Section A: General Disclosures */
export const GENERAL_DISCLOSURES_INDICATORS = [
  { id: "A.1", label: "Corporate Identity Number (CIN) of the Listed Entity", principle: 0 },
  { id: "A.2", label: "Name of the Listed Entity", principle: 0 },
  { id: "A.3", label: "Year of incorporation", principle: 0 },
  { id: "A.4", label: "Registered office address", principle: 0 },
  { id: "A.5", label: "Corporate address", principle: 0 },
  { id: "A.6", label: "E-mail", principle: 0 },
  { id: "A.7", label: "Telephone", principle: 0 },
  { id: "A.8", label: "Website", principle: 0 },
  { id: "A.9", label: "Financial year for which reporting is being done", principle: 0 },
  { id: "A.10", label: "Name of the Stock Exchange(s) where shares are listed", principle: 0 },
  { id: "A.11", label: "Paid-up Capital", unit: "₹", principle: 0 },
  { id: "A.12", label: "Name and contact details (telephone, email address) of the person who may be contacted in case of any queries on the BRSR report", principle: 0 },
  { id: "A.13", label: "Reporting boundary - Are the disclosures under this report made on a standalone basis (i.e. only for the entity) or on a consolidated basis (i.e. for the entity and all the entities which form a part of its consolidated financial statements, taken together)", principle: 0 },
];

export const TAB_INDICATORS: Record<BRSRTabId, { id: string; label: string; unit?: string; principle: number }[]> = {
  "General Disclosures": GENERAL_DISCLOSURES_INDICATORS,
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
