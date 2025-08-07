import React from 'react';

// arc: boolean - if true, displays curved progress bar (arc style)
function PercentageDial({ value, label, arc }) {
  // Clamp value between 0 and 100
  const pct = Math.max(0, Math.min(100, value));

  if (arc) {
    // Arc style: use SVG for curved progress
    // Gradient colors: orange (left), green (right)
    const r = 40, stroke = 8;
    const cx = 50, cy = 50;
    const startAngle = -135, endAngle = 135;
    const range = endAngle - startAngle;
    const percentFill = (pct / 100) * range;
    const theta = startAngle + percentFill;

    // Convert degrees to radians
    const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
      const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
      return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
      };
    };

    const arcPath = () => {
      const start = polarToCartesian(cx, cy, r, endAngle);
      const end = polarToCartesian(cx, cy, r, startAngle);
      return [
        "M", start.x, start.y,
        "A", r, r, 0, 1, 1, end.x, end.y
      ].join(" ");
    };

    const fillArcPath = () => {
      const start = polarToCartesian(cx, cy, r, startAngle);
      const end = polarToCartesian(cx, cy, r, theta);
      const largeArcFlag = percentFill > 180 ? 1 : 0;
      return [
        "M", start.x, start.y,
        "A", r, r, 0, largeArcFlag, 1, end.x, end.y
      ].join(" ");
    };

    return (
      <div className="percentage-dial dial-arc">
        <svg width={100} height={80} style={{ overflow: 'visible' }}>
          {/* background arc */}
          <path d={arcPath()} stroke="#e0e0e0" strokeWidth={stroke} fill="none" />
          {/* colored arc */}
          <defs>
            <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f9a825" />
              <stop offset="100%" stopColor="#388e3c" />
            </linearGradient>
          </defs>
          <path
            d={fillArcPath()}
            stroke="url(#arcGradient)"
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
          />
          {/* percentage text */}
          <text
            x="50"
            y="52"
            textAnchor="middle"
            fontSize="24"
            fontWeight="bold"
            fill="#1976d2"
            dominantBaseline="middle"
          >
            {pct}%
          </text>
        </svg>
        <div className="label">{label}</div>
      </div>
    );
  }

  // Simple circle style (for Efficiency)
  return (
    <div className="percentage-dial dial-circle">
      <div className="circle">{pct}%</div>
      <div className="label">{label}</div>
    </div>
  );
}

export default PercentageDial;