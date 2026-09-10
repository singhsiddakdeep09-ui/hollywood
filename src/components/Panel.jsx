import ChartSwitch from "./ChartSwitch";

/* One frame of the filmstrip: a chart/visual with its finding + insight. */
export default function Panel({ index, total, kind, frame, title, finding, insight, chart, stat }) {
  return (
    <article className="panel">
      <div className="panel-inner">

        <div className="panel-body">
          <div className="panel-left" data-rise>
            <h2>{title}</h2>
            {stat && (
              <div className="panel-stat">
                <span className="stat-value mono">{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            )}
            {finding && <p className="panel-finding">{finding}</p>}
            {insight && (
              <p className="panel-insight">
                <span className="insight-mark mono">↳</span> {insight}
              </p>
            )}
          </div>

          <div className="panel-right" data-rise>
            <ChartSwitch kind={kind} data={chart} />
          </div>
        </div>
      </div>
    </article>
  );
}
