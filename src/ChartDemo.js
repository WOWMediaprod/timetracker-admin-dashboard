import React from "react";
import { Card, CardContent, Typography } from "@mui/material";
import { Line } from "react-chartjs-2";
import { Chart, LineController, LineElement, PointElement, LinearScale, Title, CategoryScale } from "chart.js";

Chart.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale);

const data = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May"],
  datasets: [
    {
      label: "Views",
      data: [150, 200, 180, 220, 300],
      fill: false,
      borderColor: "#1976d2",
      tension: 0.1,
    },
  ],
};

function ChartDemo() {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6">Monthly Views</Typography>
        <Line data={data} />
      </CardContent>
    </Card>
  );
}

export default ChartDemo;