import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { MarketingHomepage } from "@/components/marketing/MarketingHomepage";

export default function HomePage() {
  return (
    <>
      <MarketingHeader />
      <main>
        <MarketingHomepage />
      </main>
      <MarketingFooter />
    </>
  );
}
