export type SdgGoal = {
  id:
    | "sdg1"
    | "sdg2"
    | "sdg3"
    | "sdg4"
    | "sdg5"
    | "sdg6"
    | "sdg7"
    | "sdg8"
    | "sdg9"
    | "sdg10"
    | "sdg11"
    | "sdg12"
    | "sdg13"
    | "sdg14"
    | "sdg15"
    | "sdg16"
    | "sdg17";
  number: number;
  title: string;
  color: string; // hex
};

// SDG brand colors (UN SDG Guidelines). Used for a lightweight “icon tile” until
// official icon assets are wired in.
export const SDG_GOALS: SdgGoal[] = [
  { id: "sdg1", number: 1, title: "No Poverty", color: "#E5243B" },
  { id: "sdg2", number: 2, title: "Zero Hunger", color: "#DDA63A" },
  { id: "sdg3", number: 3, title: "Good Health and Well-Being", color: "#4C9F38" },
  { id: "sdg4", number: 4, title: "Quality Education", color: "#C5192D" },
  { id: "sdg5", number: 5, title: "Gender Equality", color: "#FF3A21" },
  { id: "sdg6", number: 6, title: "Clean Water and Sanitation", color: "#26BDE2" },
  { id: "sdg7", number: 7, title: "Affordable and Clean Energy", color: "#FCC30B" },
  { id: "sdg8", number: 8, title: "Decent Work and Economic Growth", color: "#A21942" },
  { id: "sdg9", number: 9, title: "Industry, Innovation and Infrastructure", color: "#FD6925" },
  { id: "sdg10", number: 10, title: "Reduced Inequalities", color: "#DD1367" },
  { id: "sdg11", number: 11, title: "Sustainable Cities and Communities", color: "#FD9D24" },
  { id: "sdg12", number: 12, title: "Responsible Consumption and Production", color: "#BF8B2E" },
  { id: "sdg13", number: 13, title: "Climate Action", color: "#3F7E44" },
  { id: "sdg14", number: 14, title: "Life Below Water", color: "#0A97D9" },
  { id: "sdg15", number: 15, title: "Life on Land", color: "#56C02B" },
  { id: "sdg16", number: 16, title: "Peace, Justice and Strong Institutions", color: "#00689D" },
  { id: "sdg17", number: 17, title: "Partnerships for the Goals", color: "#19486A" },
];

export function sdgIdToNumber(id: string) {
  const match = /^sdg(\d{1,2})$/.exec(id);
  if (!match) return null;
  const n = Number(match[1]);
  return Number.isFinite(n) && n >= 1 && n <= 17 ? n : null;
}

