import {
  ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis,
  CartesianGrid, ReferenceLine, Tooltip, ZAxis,
} from "recharts";
import { MAIN } from "../data/panels";

const MAROON = "#800000";
const OLIVE = "#556B2F";
const FOG = "#a1a1aa";
const CHALK = "#fafafa";
const INK2 = "#18181b";
const axis = { stroke: FOG, fontSize: 11, fontFamily: "'JetBrains Mono', ui-monospace, monospace" };
const grid = "rgba(255,255,255,.06)";

const points = MAIN.chart.points;
const originals = points.filter((p) => !p.seq);
const sequels = points.filter((p) => p.seq);

/* enlarged, ringed dot for the hovered film */
const ActiveDot = (props) => (
  <circle cx={props.cx} cy={props.cy} r={8}
    fill={props.fill} stroke={INK2} strokeWidth={2} />
);

function Tip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="chart-tip mono">
      <div className="chart-tip-title">{p.title}</div>
      <div className="chart-tip-note">{p.genre}{p.seq ? " · sequel" : ""}</div>
      <div className="chart-tip-row">
        <span className="chart-tip-k">Trailer views</span>
        <span className="chart-tip-v" style={{ color: MAROON }}>{p.views}M</span>
      </div>
      <div className="chart-tip-row">
        <span className="chart-tip-k">Box office</span>
        <span className="chart-tip-v" style={{ color: OLIVE }}>${p.rev}M</span>
      </div>
    </div>
  );
}

export default function MainScatter() {
  return (
    <section className="main-graph">
      <div className="main-graph-inner">
        <header className="main-head">

          <h2>{MAIN.title}</h2>
          <div className="main-stat">
            <span className="mono main-stat-value" style={{ fontSize: "clamp(1rem, 1.8vw, 1.4rem)" }}>{MAIN.stat.value}</span>
            <span className="main-stat-label">{MAIN.stat.label}</span>
          </div>
          <p className="main-finding">{MAIN.finding}</p>
          <p className="main-insight">
            <span className="insight-mark mono">↳</span> {MAIN.insight}
          </p>
          <div className="main-legend mono">
            <span><i style={{ background: OLIVE }} /> Original</span>
            <span><i style={{ background: MAROON }} /> Sequel</span>
            <span className="main-legend-line"><i /> fit (r = {MAIN.chart.r})</span>
          </div>
        </header>

        <div className="main-plot">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 24, bottom: 40, left: 12 }}>
              <CartesianGrid stroke={grid} />
              <XAxis type="number" dataKey="x" name="views" tick={axis}
                domain={["dataMin - 0.5", "dataMax + 0.5"]}
                axisLine={{ stroke: grid }} tickLine={false}
                label={{ value: "log trailer views →", position: "bottom",
                  fill: FOG, fontSize: 11, offset: 16 }} />
              <YAxis type="number" dataKey="y" name="revenue" tick={axis}
                domain={["dataMin - 0.5", "dataMax + 0.5"]}
                axisLine={{ stroke: grid }} tickLine={false}
                label={{ value: "log box-office revenue →", angle: -90,
                  position: "insideLeft", fill: FOG, fontSize: 11, style: { textAnchor: "middle" } }} />
              <ZAxis range={[42, 42]} />
              <ReferenceLine stroke={CHALK} strokeOpacity={0.55} strokeDasharray="5 4"
                segment={MAIN.chart.line} ifOverflow="extendDomain" />
              <Tooltip cursor={{ stroke: FOG, strokeDasharray: "3 3" }} content={<Tip />} />
              <Scatter name="Original" data={originals} fill={OLIVE} fillOpacity={0.7}
                activeShape={ActiveDot} isAnimationActive animationDuration={800} />
              <Scatter name="Sequel" data={sequels} fill={MAROON} fillOpacity={0.85}
                activeShape={ActiveDot} isAnimationActive animationDuration={800} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
