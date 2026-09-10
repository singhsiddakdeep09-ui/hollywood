import { useState } from "react";
import {
  ResponsiveContainer, ComposedChart, BarChart, Bar, Line, Area,
  XAxis, YAxis, CartesianGrid, Cell, ReferenceLine, LabelList, Tooltip,
} from "recharts";

const MAROON = "#800000";
const OLIVE = "#556B2F";
const FOG = "#a1a1aa";
const CHALK = "#fafafa";
const INK2 = "#18181b";

const axis = { stroke: FOG, fontSize: 11, fontFamily: "'JetBrains Mono', ui-monospace, monospace" };
const grid = "rgba(255,255,255,.06)";
const hoverCursor = { fill: "rgba(85,107,47,.06)" };

const correlateColor = (b) => (b.partial ? OLIVE : b.value >= 0.5 ? MAROON : FOG);

/* ---------- tooltip row helper ---------- */
const Row = ({ k, v, c = CHALK }) => (
  <div className="chart-tip-row">
    <span className="chart-tip-k">{k}</span>
    <span className="chart-tip-v" style={{ color: c }}>{v}</span>
  </div>
);

/* ---------- module-level tooltip contents (Recharts injects active/payload) ---------- */
function CorrelatesTip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="chart-tip mono">
      <div className="chart-tip-title">{p.label}</div>
      <Row k="r vs revenue" v={p.value.toFixed(2)} c={correlateColor(p)} />
      {p.partial && <div className="chart-tip-note">views, budget held constant</div>}
    </div>
  );
}
function SequelTip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="chart-tip mono">
      <div className="chart-tip-title">{p.group}<span className="chart-tip-n"> · n={p.n}</span></div>
      <Row k="Avg revenue" v={`$${p.rev}M`} c={OLIVE} />
      <Row k="Avg trailer views" v={`${p.views}M`} c={MAROON} />
      <Row k="ROI (× budget)" v={`${p.roi}×`} />
    </div>
  );
}
function GenreTip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="chart-tip mono">
      <div className="chart-tip-title">{p.genre}<span className="chart-tip-n"> · n={p.n}</span></div>
      <Row k="Avg trailer views" v={`${p.views}M`} c={MAROON} />
      <Row k="ROI (× budget)" v={`${p.roi}×`} c={OLIVE} />
    </div>
  );
}
function BudgetTip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="chart-tip mono">
      <div className="chart-tip-title chart-tip-cap">{p.bin}-budget<span className="chart-tip-n"> · ~${p.budget}M</span></div>
      <Row k="Avg trailer views" v={`${p.views}M`} c={MAROON} />
      <Row k="ROI (× budget)" v={`${p.roi}×`} c={OLIVE} />
    </div>
  );
}

/* ============ 1. CORRELATES - ranked horizontal bars ============ */
function CorrelatesChart({ data }) {
  const [active, setActive] = useState(null);
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data.bars} layout="vertical"
        margin={{ top: 8, right: 44, bottom: 8, left: 8 }}
        onMouseMove={(s) => setActive(s?.activeTooltipIndex ?? null)}
        onMouseLeave={() => setActive(null)}>
        <CartesianGrid stroke={grid} horizontal={false} />
        <XAxis type="number" tick={axis} axisLine={{ stroke: grid }} tickLine={false}
          domain={data.domain || ["auto", "auto"]} />
        <YAxis type="category" dataKey="label" tick={{ ...axis, fontSize: 12, fill: CHALK }}
          width={110} axisLine={false} tickLine={false} />
        <ReferenceLine x={0} stroke={FOG} />
        <Tooltip cursor={hoverCursor} content={<CorrelatesTip />} />
        <Bar dataKey="value" radius={[0, 2, 2, 0]} isAnimationActive
          animationDuration={900} animationEasing="ease-out">
          {data.bars.map((b, i) => (
            <Cell key={i} fill={correlateColor(b)}
              fillOpacity={active === null || active === i ? 1 : 0.32} />
          ))}
          <LabelList dataKey="value" position="right" className="mono"
            fill={CHALK} fontSize={11} formatter={(v) => v.toFixed(2)} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ============ 2. SEQUEL PREMIUM - revenue bars, rich tooltip ============ */
function SequelChart({ data }) {
  const [active, setActive] = useState(null);
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data.rows} margin={{ top: 24, right: 12, bottom: 12, left: 8 }}
        onMouseMove={(s) => setActive(s?.activeTooltipIndex ?? null)}
        onMouseLeave={() => setActive(null)}>
        <CartesianGrid stroke={grid} vertical={false} />
        <XAxis dataKey="group" tick={{ ...axis, fontSize: 13, fill: CHALK }}
          axisLine={{ stroke: grid }} tickLine={false} interval={0} />
        <YAxis tick={axis} axisLine={{ stroke: grid }} tickLine={false}
          label={{ value: "avg revenue ($M)", angle: -90, position: "insideLeft",
            fill: FOG, fontSize: 11, style: { textAnchor: "middle" } }} />
        <Tooltip cursor={hoverCursor} content={<SequelTip />} />
        <Bar dataKey="rev" radius={[3, 3, 0, 0]} isAnimationActive
          animationDuration={900} animationEasing="ease-out">
          {data.rows.map((r, i) => (
            <Cell key={i} fill={r.group === "Sequels" ? MAROON : OLIVE}
              fillOpacity={active === null || active === i ? 1 : 0.35} />
          ))}
          <LabelList dataKey="rev" position="top" className="mono"
            fill={CHALK} fontSize={12} formatter={(v) => `$${v}M`} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ============ 3. GENRE - views (bars) vs ROI (line), dual axis ============ */
function GenreChart({ data }) {
  const [active, setActive] = useState(null);
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data.rows} margin={{ top: 20, right: 16, bottom: 28, left: 4 }}
        onMouseMove={(s) => setActive(s?.activeTooltipIndex ?? null)}
        onMouseLeave={() => setActive(null)}>
        <CartesianGrid stroke={grid} vertical={false} />
        <XAxis dataKey="genre" tick={{ ...axis, fontSize: 10 }} interval={0}
          axisLine={{ stroke: grid }} tickLine={false} angle={-24} dy={10} height={44} />
        <YAxis yAxisId="v" tick={axis} axisLine={{ stroke: grid }} tickLine={false}
          label={{ value: "views (M)", angle: -90, position: "insideLeft",
            fill: MAROON, fontSize: 10, style: { textAnchor: "middle" } }} />
        <YAxis yAxisId="r" orientation="right" tick={axis} axisLine={{ stroke: grid }}
          tickLine={false} domain={[0, "auto"]} tickFormatter={(v) => `${v}×`}
          label={{ value: "ROI", angle: 90, position: "insideRight",
            fill: OLIVE, fontSize: 10, style: { textAnchor: "middle" } }} />
        <ReferenceLine yAxisId="r" y={1} stroke={FOG} strokeDasharray="3 3" />
        <Tooltip cursor={hoverCursor} content={<GenreTip />} />
        <Bar yAxisId="v" dataKey="views" radius={[2, 2, 0, 0]} isAnimationActive
          animationDuration={900}>
          {data.rows.map((r, i) => (
            <Cell key={i} fill={MAROON}
              fillOpacity={active === null || active === i ? 0.9 : 0.28} />
          ))}
        </Bar>
        <Line yAxisId="r" type="monotone" dataKey="roi" stroke={OLIVE} strokeWidth={2}
          dot={{ r: 3, fill: OLIVE, strokeWidth: 0 }}
          activeDot={{ r: 6, fill: OLIVE, stroke: INK2, strokeWidth: 2 }}
          isAnimationActive animationDuration={1100} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

/* ============ 4. BUDGET TRAP - views (area) vs ROI (line), dual axis ============ */
function BudgetChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data.rows} margin={{ top: 20, right: 16, bottom: 28, left: 4 }}>
        <defs>
          <linearGradient id="viewFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={MAROON} stopOpacity={0.35} />
            <stop offset="100%" stopColor={MAROON} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={grid} vertical={false} />
        <XAxis dataKey="bin" tick={{ ...axis, fontSize: 11, fill: CHALK }} interval={0}
          axisLine={{ stroke: grid }} tickLine={false}
          label={{ value: "budget tier →", position: "bottom", fill: FOG, fontSize: 10, offset: 12 }} />
        <YAxis yAxisId="v" tick={axis} axisLine={{ stroke: grid }} tickLine={false}
          label={{ value: "views (M)", angle: -90, position: "insideLeft",
            fill: MAROON, fontSize: 10, style: { textAnchor: "middle" } }} />
        <YAxis yAxisId="r" orientation="right" tick={axis} axisLine={{ stroke: grid }}
          tickLine={false} domain={[0, 5]} tickFormatter={(v) => `${v}×`}
          label={{ value: "ROI", angle: 90, position: "insideRight",
            fill: OLIVE, fontSize: 10, style: { textAnchor: "middle" } }} />
        <ReferenceLine yAxisId="r" y={1} stroke={FOG} strokeDasharray="3 3" />
        <Tooltip cursor={hoverCursor} content={<BudgetTip />} />
        <Area yAxisId="v" type="monotone" dataKey="views" stroke={MAROON} strokeWidth={2}
          fill="url(#viewFill)" isAnimationActive animationDuration={1000}
          activeDot={{ r: 5, fill: MAROON, stroke: INK2, strokeWidth: 2 }} />
        <Line yAxisId="r" type="monotone" dataKey="roi" stroke={OLIVE} strokeWidth={2.5}
          dot={{ r: 3, fill: OLIVE, strokeWidth: 0 }}
          activeDot={{ r: 6, fill: OLIVE, stroke: INK2, strokeWidth: 2 }}
          isAnimationActive animationDuration={1200} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export default function ChartSwitch({ kind, data }) {
  if (kind === "correlates") return <CorrelatesChart data={data} />;
  if (kind === "sequel") return <SequelChart data={data} />;
  if (kind === "genre") return <GenreChart data={data} />;
  if (kind === "budget") return <BudgetChart data={data} />;
  return <div className="chart-placeholder mono">chart</div>;
}
