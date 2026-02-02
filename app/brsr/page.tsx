import { BRSRClient } from "@/components/brsr/brsr-client";

export const metadata = {
  title: "BRSR Sustainability Dashboard",
  description: "SEBI Business Responsibility & Sustainability Reporting – regulatory-grade ESG monitoring",
};

export default function BRSRPage() {
  return (
    <div className="relative min-h-screen">
      <BRSRClient />
    </div>
  );
}
