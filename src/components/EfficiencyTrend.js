import React from "react";
import { Line } from "react-chartjs-2";

export default function EfficiencyTrend({ data, labels }) {
  const chartData = {
    labels,
    datasets: [
      {
        label: "Efficiency (%)",
        data,
        backgroundColor: "#388e3c",
        borderColor: "#388e3c",
        fill: false,
      }
    ]
  };
  return <Line data={chartData} />;
}