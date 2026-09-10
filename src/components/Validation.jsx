import { useState } from "react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Cell, ReferenceLine, LabelList, Tooltip,
} from "recharts";
import { VALIDATION } from "../data/panels";

const MAROON = "#800000";
const OLIVE = "#556B2F";
const FOG = "#a1a1aa";
const CHALK = "#fafafa";
const CYAN = "#06b6d4";
const AMBER = "#f59e0b";

const axis = { stroke: FOG, fontSize: 11, fontFamily: "'JetBrains Mono', ui-monospace, monospace" };
const grid = "rgba(255,255,255,.06)";
const hoverCursor = { fill: "rgba(85,107,47,.06)" };
const pct = (v) => `${Math.round(v * 100)}%`;

/* ---------- coefficient tooltip ---------- */
function CoeffTip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="chart-tip mono" style={{ maxWidth: 220 }}>
      <div className="chart-tip-title">{p.label}
        <span className="chart-tip-n" style={{ color: p.hl ? OLIVE : p.value < 0 ? FOG : MAROON }}>
          {"  "}{p.value > 0 ? "+" : ""}{p.value.toFixed(2)}
        </span>
      </div>
      <div className="chart-tip-note" style={{ whiteSpace: "normal", lineHeight: 1.4 }}>{p.note}</div>
    </div>
  );
}



/* ============ Model 3 coefficients - ranked horizontal bars ============ */
function CoefficientChart() {
  const [active, setActive] = useState(null);
  const bars = VALIDATION.coefficients;
  const color = (b) => (b.hl ? OLIVE : MAROON);
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={bars} layout="vertical"
        margin={{ top: 8, right: 52, bottom: 8, left: 8 }}
        onMouseMove={(s) => setActive(s?.activeTooltipIndex ?? null)}
        onMouseLeave={() => setActive(null)}>
        <CartesianGrid stroke={grid} horizontal={false} />
        <XAxis type="number" domain={[-0.25, 0.6]} tick={axis}
          axisLine={{ stroke: grid }} tickLine={false} />
        <YAxis type="category" dataKey="label" tick={{ ...axis, fontSize: 12, fill: CHALK }}
          width={96} axisLine={false} tickLine={false} />
        <ReferenceLine x={0} stroke={FOG} />
        <Tooltip cursor={hoverCursor} content={<CoeffTip />} />
        <Bar dataKey="value" radius={2} isAnimationActive animationDuration={900} animationEasing="ease-out">
          {bars.map((b, i) => (
            <Cell key={i} fill={color(b)}
              fillOpacity={active === null || active === i ? (b.value < 0 ? 0.55 : 1) : 0.3} />
          ))}
          <LabelList dataKey="value" position="right" className="mono" fill={CHALK}
            fontSize={11} formatter={(v) => (v > 0 ? "+" : "") + v.toFixed(2)} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ---------- R² progression tooltip ---------- */
function ModelTip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="chart-tip mono" style={{ maxWidth: 240 }}>
      <div className="chart-tip-title">{p.model}
        <span className="chart-tip-n"> · explains {pct(p.r2)}</span></div>
      <div className="chart-tip-note" style={{ whiteSpace: "normal", lineHeight: 1.4 }}>{p.blurb}</div>
    </div>
  );
}

/* ============ R² progression - stacked "step" bars ============ */
function R2Chart() {
  const [active, setActive] = useState(null);
  const rows = VALIDATION.models;
  const dim = (i) => (active === null || active === i ? 1 : 0.35);
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={rows} margin={{ top: 26, right: 8, bottom: 8, left: 4 }}
        onMouseMove={(s) => setActive(s?.activeTooltipIndex ?? null)}
        onMouseLeave={() => setActive(null)}>
        <CartesianGrid stroke={grid} vertical={false} />
        <XAxis dataKey="axis" tick={{ ...axis, fontSize: 12, fill: CHALK }}
          axisLine={{ stroke: grid }} tickLine={false} interval={0} />
        <YAxis domain={[0, 0.8]} ticks={[0, 0.2, 0.4, 0.6, 0.8]} tickFormatter={pct}
          tick={axis} axisLine={{ stroke: grid }} tickLine={false} />
        <Tooltip cursor={hoverCursor} content={<ModelTip />} />
        <Bar dataKey="base" stackId="r" isAnimationActive animationDuration={800}>
          {rows.map((r, i) => <Cell key={i} fill={CYAN} fillOpacity={0.8 * dim(i)} />)}
        </Bar>
        <Bar dataKey="budget" stackId="r" isAnimationActive animationDuration={800}>
          {rows.map((r, i) => <Cell key={i} fill={OLIVE} fillOpacity={dim(i)} />)}
        </Bar>
        <Bar dataKey="attention" stackId="r" radius={[2, 2, 0, 0]} isAnimationActive animationDuration={800}>
          {rows.map((r, i) => <Cell key={i} fill={AMBER} fillOpacity={0.7 * dim(i)} />)}
          <LabelList dataKey="r2" position="top" className="mono" fill={CHALK} fontSize={13}
            formatter={pct} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function Validation() {
  const V = VALIDATION;
  return (
    <section className="validation">
      <div className="validation-inner">
        <header className="validation-head">
          <p className="mono val-eyebrow">{V.eyebrow}</p>
          <h2>{V.title}</h2>
          <p className="val-intro">{V.intro}</p>
        </header>

        {/* block 1 - coefficients + horror takeaway */}
        <div className="val-block">
          <figure className="val-plot-wrap">
            <figcaption className="val-cap mono">Model 3 - what drives box office</figcaption>
            <div className="val-plot"><CoefficientChart /></div>
            <p className="val-subcap">{V.coeffNote}</p>
          </figure>
          <div className="val-take">
            <span className="val-take-tag mono">{V.takeaways[1].tag}</span>
            <p>{V.takeaways[1].body}</p>
            <div className="val-legend mono">
              <span><i style={{ background: MAROON }} /> positive factors</span>
              <span><i style={{ background: MAROON, opacity: 0.55 }} /> negative factors</span>
              <span><i style={{ background: OLIVE }} /> trailer views</span>
            </div>
          </div>
        </div>

        {/* block 2 - R² progression + budget takeaway */}
        <div className="val-block val-block-rev">
          <figure className="val-plot-wrap">
            <figcaption className="val-cap mono">How much the model can explain</figcaption>
            <div className="val-plot"><R2Chart /></div>

          </figure>
          <div className="val-take">
            <span className="val-take-tag mono">{V.takeaways[0].tag}</span>
            <p>{V.takeaways[0].body}</p>
            <div className="val-legend mono">
              <span><i style={{ background: CYAN, opacity: 0.8 }} /> basic factors</span>
              <span><i style={{ background: OLIVE }} /> budget adds</span>
              <span><i style={{ background: AMBER, opacity: 0.7 }} /> attention adds</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
