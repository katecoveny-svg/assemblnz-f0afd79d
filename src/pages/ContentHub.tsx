import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import ContentHubHero from "@/components/contenthub/ContentHubHero";
import ContentHubShowcase from "@/components/contenthub/ContentHubShowcase";
import ContentHubComparison from "@/components/contenthub/ContentHubComparison";
import ContentHubCatalogue from "@/components/contenthub/ContentHubCatalogue";
import ContentHubCTA from "@/components/contenthub/ContentHubCTA";

const ContentHub = () => (
  <div className="min-h-screen" style={{ background: "hsl(var(--background))" }}>
    <BrandNav />
    <ContentHubHero />
    <ContentHubShowcase />
    <ContentHubComparison />
    <ContentHubCatalogue />
    <ContentHubCTA />
    <BrandFooter />
  </div>
);

export default ContentHub;
