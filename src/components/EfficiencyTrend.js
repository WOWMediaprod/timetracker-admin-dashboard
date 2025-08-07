import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

function EfficiencyTrend({ employee, timeframe }) {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [chartData, setChartData] = useState({ labels: [], data: [] });

  // Helper to group logs by week
  function groupLogsByWeek(logs) {
    const grouped = {};
    logs.forEach(log => {
      const date = new Date(log.dateStr); // log.dateStr = yyyy-mm-dd
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
      const weekStart = new Date(date.setDate(diff));
      const weekStr = weekStart.toISOString().slice(0, 10);
      if (!grouped[weekStr]) grouped[weekStr] = [];
      grouped[weekStr].push(log.efficiency ?? 0);
    });
    return grouped;
  }

  useEffect(() => {
    async function fetchData() {
      if (!employee || !employee.trello_id) return;

      const logsQuery = query(
        collection(db, 'work_logs'),
        where('user_id', '==', employee.trello_id)
      );
      const querySnapshot = await getDocs(logsQuery);

      // Collect logs with dateStr
      const logs = [];
      querySnapshot.forEach((doc) => {
        const log = doc.data();
        let timestamp = log.timestamp;
        let dateStr = '';
        if (timestamp) {
          const seconds = timestamp._seconds ?? timestamp.seconds;
          dateStr = new Date(seconds * 1000).toISOString().slice(0, 10);
        } else {
          dateStr = "Unknown";
        }
        logs.push({ ...log, dateStr });
      });

      let groupedLogs = {};
      let labels = [];
      let avgEfficiency = [];
      const N = 7;

      if (timeframe === 'Weekly') {
        groupedLogs = groupLogsByWeek(logs);
        labels = Object.keys(groupedLogs).sort().slice(-N);
        avgEfficiency = labels.map(week => {
          const arr = groupedLogs[week];
          return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
        });
      } else {
        // Daily
        groupedLogs = {};
        logs.forEach(log => {
          if (!groupedLogs[log.dateStr]) groupedLogs[log.dateStr] = [];
          groupedLogs[log.dateStr].push(log.efficiency ?? 0);
        });
        labels = Object.keys(groupedLogs).sort().slice(-N);
        avgEfficiency = labels.map(date => {
          const arr = groupedLogs[date];
          return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
        });
      }

      setChartData({ labels, data: avgEfficiency });
    }
    fetchData();
  }, [employee, timeframe]);

  useEffect(() => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }
    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [
          {
            label: 'Efficiency (%)',
            data: chartData.data,
            backgroundColor: '#388e3c',
            borderColor: '#388e3c',
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true },
          title: { display: true, text: 'Efficiency Trend' },
        },
        scales: {
          x: { type: 'category', title: { display: true, text: 'Date' } },
          y: { beginAtZero: true, title: { display: true, text: 'Efficiency (%)' } },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [chartData]);

  return (
    <div style={{ width: '500px', height: '300px', margin: '0 auto' }}>
      <canvas ref={chartRef} />
    </div>
  );
}

export default EfficiencyTrend;