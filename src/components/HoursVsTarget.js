import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

// Utility to convert "4h 45m 6s" to hours (float)
function durationToHours(duration) {
  if (!duration) return 0;
  let hours = 0, mins = 0, secs = 0;
  const match = duration.match(/(\d+)h\s*(\d+)m\s*(\d+)s/);
  if (match) {
    hours = parseInt(match[1] || "0", 10);
    mins = parseInt(match[2] || "0", 10);
    secs = parseInt(match[3] || "0", 10);
  }
  return hours + mins / 60 + secs / 3600;
}

function HoursVsTarget({ employee, timeframe }) {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [chartData, setChartData] = useState({ labels: [], data: [], target: [] });

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
      grouped[weekStr].push(durationToHours(log.total_duration));
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
      let sumHours = [];
      let target = [];
      const N = 7;

      if (timeframe === 'Weekly') {
        groupedLogs = groupLogsByWeek(logs);
        labels = Object.keys(groupedLogs).sort().slice(-N);
        sumHours = labels.map(week => {
          const arr = groupedLogs[week];
          return arr.length ? arr.reduce((a, b) => a + b, 0) : 0;
        });
        target = labels.map(() => 8.5 * 5); // Weekly target (5 days)
      } else {
        // Daily
        groupedLogs = {};
        logs.forEach(log => {
          if (!groupedLogs[log.dateStr]) groupedLogs[log.dateStr] = [];
          groupedLogs[log.dateStr].push(durationToHours(log.total_duration));
        });
        labels = Object.keys(groupedLogs).sort().slice(-N);
        sumHours = labels.map(date => {
          const arr = groupedLogs[date];
          return arr.length ? arr.reduce((a, b) => a + b, 0) : 0;
        });
        target = labels.map(() => 8.5); // Daily target
      }

      setChartData({ labels, data: sumHours, target });
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
            label: 'Hours Worked',
            data: chartData.data,
            backgroundColor: '#1976d2',
            borderColor: '#1976d2',
            fill: false,
          },
          {
            label: 'Target Hours',
            data: chartData.target,
            backgroundColor: '#d32f2f',
            borderColor: '#d32f2f',
            borderDash: [5, 5],
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true },
          title: { display: true, text: 'Hours vs Target' },
        },
        scales: {
          x: { type: 'category', title: { display: true, text: 'Date' } },
          y: { beginAtZero: true, title: { display: true, text: 'Hours' } },
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

export default HoursVsTarget;