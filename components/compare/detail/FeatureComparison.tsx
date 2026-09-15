import "./FeatureComparison.css";

interface Feature {
  feature: string;
  hireko: string;
  competitor: string;
}

interface FeatureComparisonProps {
  competitorName: string;
  features: Feature[];
}

export default function FeatureComparison({
  competitorName,
  features,
}: FeatureComparisonProps) {
  return (
    <section
      className="featureComparison"
      id="feature-comparison"
      aria-labelledby="feature-comparison-title"
    >
      <div className="featureComparisonContainer">
        <div className="featureComparisonHeader">
          <span className="featureComparisonEyebrow">
            Detailed Comparison
          </span>

          <h2 id="feature-comparison-title">
            Feature-by-Feature <span>Comparison</span>
          </h2>

          <p>
            Compare Hireko and {competitorName} across the most important
            AI hiring capabilities, workflows, pricing, and candidate
            experience.
          </p>
        </div>

        <div className="featureComparisonTableWrapper">
          <table className="featureComparisonTable">
            <thead>
              <tr>
                <th>Feature</th>
                <th className="hirekoColumn">Hireko</th>
                <th>{competitorName}</th>
              </tr>
            </thead>

            <tbody>
              {features.map((item) => (
                <tr key={item.feature}>
                  <td className="featureName">
                    {item.feature}
                  </td>

                  <td className="hirekoColumn">
                    {item.hireko}
                  </td>

                  <td>
                    {item.competitor}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="featureComparisonNote">
          Features and capabilities may vary by plan and change as platforms
          release product updates.
        </p>
      </div>
    </section>
  );
}