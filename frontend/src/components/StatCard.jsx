const StatCard = ({ title, value, subtitle, trend }) => {
  const trendClass = trend === 'up' ? 'profit' : trend === 'down' ? 'loss' : ''

  return (
    <div className="metric">
      <p className="metric-label">{title}</p>
      <p className={`metric-value ${trendClass}`}>{value}</p>
      {subtitle && <p className={`metric-note ${trendClass}`}>{subtitle}</p>}
    </div>
  )
}

export default StatCard
