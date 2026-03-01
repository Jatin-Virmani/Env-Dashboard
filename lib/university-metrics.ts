export const UNIVERSITY_METRICS = {
  potableWater: {
    year: 2025,
    unit: "kL",
    mruTubewell: 16010,
    hostelTubewell: 15405,
    total: 31415,
  },
  stpElectricity: {
    periodLabel: "Jan 2025 – Jan 2026",
    totalKWh: 67670,
    startReading: 214510,
    endReading: 282180,
    months: [
      { label: "Jan-25", reading: 219855, consumptionKWh: 5345 },
      { label: "Feb-25", reading: 221880, consumptionKWh: 2025 },
      { label: "Mar-25", reading: 228058, consumptionKWh: 6178 },
      { label: "Apr-25", reading: 234531, consumptionKWh: 6473 },
      { label: "May-25", reading: 241482, consumptionKWh: 6951 },
      { label: "Jun-25", reading: 247570, consumptionKWh: 6088 },
      { label: "Jul-25", reading: 250392, consumptionKWh: 2822 },
      { label: "Aug-25", reading: 254289, consumptionKWh: 3897 },
      { label: "Sep-25", reading: 260701, consumptionKWh: 6412 },
      { label: "Oct-25", reading: 264377, consumptionKWh: 3676 },
      { label: "Nov-25", reading: 269932, consumptionKWh: 5555 },
      { label: "Dec-25", reading: 276720, consumptionKWh: 6788 },
      { label: "Jan-26", reading: 282180, consumptionKWh: 5460 },
    ],
  },
  stpMotors: {
    rows: [
      { hp: 7.5, installed: 4, standby: 2, use: "Air Compressor" },
      { hp: 2.0, installed: 4, standby: 2, use: "UF" },
      { hp: 2.0, installed: 2, standby: 1, use: "Filter feed pump" },
      { hp: 2.0, installed: 2, standby: 1, use: "Sludge" },
      { hp: 3.0, installed: 2, standby: 1, use: "Lifting" },
      { hp: 7.5, installed: 2, standby: 1, use: "Outlet water supply" },
    ],
  },
  roPlants: {
    totalCount: 3,
    totalCapacityLph: 1500,
    plants: [
      { capacityLph: 500, installed: 1, standby: 0, location: "K block" },
      { capacityLph: 500, installed: 1, standby: 0, location: "H block" },
      { capacityLph: 500, installed: 1, standby: 0, location: "CBH 2" },
    ],
  },
  mruElectricity: {
    year: 2025,
    unit: "kVAh",
    total: 1189740,
  },
  dieselGenerators: {
    label: "DG load to meet energy requirement",
    capacityKvaEach: 750,
    count: 2,
    note: "Operated only during power cuts",
  },
  ownGeneration: {
    dieselLitres: 44860,
    expenseRs: 4026901,
    kwh: 166338,
    averageUnitRateRs: 24.21,
  },
  solar: {
    installedKw: 93.72,
    annualGenerationKwh: 89175,
    proposedKw: 350,
  },
  greenBelt: {
    percentArea: 43,
  },
  schoolBuses: {
    note: "Number of school buses and fuel consumption: N.A. in report.",
  },
} as const;

