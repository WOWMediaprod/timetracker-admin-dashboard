import React from "react";

function getArcGradient(id) {
  // SVG linear gradient from red to green
  return (
    <defs>
      <linearGradient id={id} x1="100%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#e53935"/>    {/* Red */}
        <stop offset="100%" stopColor="#43a047"/>  {/* Green */}
      </linearGradient>
    </defs>
  );
}

function CurvedProgressBar({ value, label, size=80, stroke=7 }) {
  const val = Math.max(0, Math.min(100, value));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - val / 100);

  // For 9 o'clock start, rotate arc -90deg
  const gradientId = `grad-${label.replace(/\s/g, '')}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg width={size} height={size} style={{ display: "block" }}>
        {getArcGradient(gradientId)}
        {/* Background circle */}
        <circle
          cx={size/2}
          cy={size/2}
          r={radius}
          stroke="#e3f2fd"
          strokeWidth={stroke}
          fill="none"
        />
        {/* Progress arc */}
        <circle
          cx={size/2}
          cy={size/2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: "stroke-dashoffset 0.7s cubic-bezier(.4,.2,.2,1)",
            transform: "rotate(-90deg)",
            transformOrigin: "50% 50%",
          }}
        />
        {/* Value */}
        <text
          x="50%"
          y="54%"
          textAnchor="middle"
          dominantBaseline="middle"
          fontWeight="bold"
          fontSize={size * 0.30}
          fill="#22223b"
        >
          {val}%
        </text>
      </svg>
      <div style={{
        fontSize: "1em",
        color: "#7c8ca3",
        marginTop: "4px",
        fontWeight: 500,
        textAlign: "center"
      }}>
        {label}
      </div>
    </div>
  );
}

export default CurvedProgressBar;