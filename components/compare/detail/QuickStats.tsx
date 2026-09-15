import "./QuickStats.css";

interface QuickStat {
  label: string;
  value: string;
}

interface QuickStatsProps {
  stats: QuickStat[];
}

export default function QuickStats({ stats }: QuickStatsProps) {
  return (
    <section className="detailQuickStats">
      <div className="detailQuickStatsContainer">
        <div className="detailQuickStatsGrid">
          {stats.map((stat, index) => (
            <div className="detailQuickStatCard" key={index}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}