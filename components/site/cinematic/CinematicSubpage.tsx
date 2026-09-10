import {
  DetailRows,
  PageHero,
  PublicPage,
  SectionHeading,
  TextLink,
} from "@/components/public/PublicPage";

export type SubpageSpec = {
  kicker: string;
  h1a: string;
  h1b: string;
  lede: string;
  panels: Array<{ n: string; h: string; p: string }>;
  cta: { label: string; href: string };
  scene: "about" | "pilots" | "notes";
};

export function CinematicSubpage({ spec }: { spec: SubpageSpec }) {
  const image =
    spec.scene === "notes"
      ? "receipt"
      : spec.scene === "pilots"
        ? "tiles"
        : "folio";
  return (
    <PublicPage>
      <PageHero
        eyebrow={spec.kicker}
        title={spec.h1a}
        accent={spec.h1b}
        body={spec.lede}
        image={image}
      >
        <TextLink href={spec.cta.href} primary>
          {spec.cta.label}
        </TextLink>
        <TextLink href="/how-it-works">How assembl works</TextLink>
      </PageHero>
      <section id="explore" className="public-section">
        <SectionHeading
          label={spec.scene === "notes" ? "From the workbench" : "The approach"}
          title={
            spec.scene === "about"
              ? "Care in the making."
              : spec.scene === "pilots"
                ? "A small start. A clear test."
                : "Show the work behind the work."
          }
        />
        <DetailRows rows={spec.panels} />
      </section>
    </PublicPage>
  );
}
