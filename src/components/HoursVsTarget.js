import React from "react";
import { Line } from "react-chartjs-2";

export default function HoursVsTarget({ data, target, labels }) {
  const chartData = {
    labels,
    datasets: [
      {
        label: "Hours Worked",
        data,
        backgroundColor: "#1976d2",
        borderColor: "#1976d2",
        fill: false,
      },
      {
        label: "Target Hours",
        data: target,
        backgroundColor: "#d32f2f",
        borderColor: "#d32f2f",
        borderDash: [5, 5],
        fill: false,
      }
    ]
  };
  return <Line data={chartData} />;
}