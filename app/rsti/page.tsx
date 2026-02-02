import { RstiClient } from "@/components/rsti/rsti-client";

export const metadata = {
  title: "RSTI Engine | Env Dashboard",
  description: "Responsible Sustainability Transition Index – UN SDG, World Bank, data.gov.in, WHO, IMF, OECD",
};

export default function RstiPage() {
  return (
    <div className="relative min-h-screen">
      <RstiClient />
    </div>
  );
}
