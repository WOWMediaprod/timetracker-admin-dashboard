import React from 'react';

function PercentageDial({ value, label }) {
  // Use a library like react-circular-progressbar for better visuals
  return (
    <div className="percentage-dial">
      <div className="circle">{value}%</div>
      <div className="label">{label}</div>
    </div>
  );
}

export default PercentageDial;