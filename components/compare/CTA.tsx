import Link from "next/link";


type CTAProps = {
  title: string;
  description: string;
  primaryText: string;
  primaryHref: string;
  secondaryText?: string;
  secondaryHref?: string;
};

function CTA({
  title,
  description,
  primaryText,
  primaryHref,
  secondaryText,
  secondaryHref,
}: CTAProps) {
  return (
    <section aria-label="compare-cta">
      <h2>{title}</h2>
      <p>{description}</p>
      <div>
        <Link href={primaryHref}>{primaryText}</Link>
        {secondaryText && secondaryHref && (
          <Link href={secondaryHref}>{secondaryText}</Link>
        )}
      </div>
    </section>
  );
}

export default function CompareCTA() {
  return (
    <CTA
      title="Find the right AI hiring platform for your team"
      description="Compare leading AI hiring platforms across features, pricing, workflows, integrations, and candidate experience."
      primaryText="Explore Comparisons"
      primaryHref="/compare"
      secondaryText="View Our Methodology"
      secondaryHref="/compare/methodology"
    />
  );
}