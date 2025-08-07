import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import BandwidthTrend from "./BandwidthTrend";
import HoursVsTarget from "./HoursVsTarget";
import EfficiencyTrend from "./EfficiencyTrend";

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

export default function AnalyticsCharts({ userId }) {
  const [labels, setLabels] = useState([]);
  const [bandwidthData, setBandwidthData] = useState([]);
  const [hoursData, setHoursData] = useState([]);
  const [efficiencyData, setEfficiencyData] = useState([]);
  const [targetHours, setTargetHours] = useState([]);

  useEffect(() => {
    async function fetchLogs() {
      let q = collection(db, "work_logs");
      // If you want data for a specific user, use where:
      // q = query(q, where("user_id", "==", userId));
      const snapshot = await getDocs(q);
      // Group by date
      const logsByDate = {};
      snapshot.forEach(doc => {
        const data = doc.data();
        if (userId && data.user_id !== userId) return;
        // Get date (from timestamp seconds)
        const ts = data.timestamp?._seconds;
        const dateStr = ts
          ? new Date(ts * 1000).toISOString().slice(0, 10)
          : "Unknown";
        if (!logsByDate[dateStr]) logsByDate[dateStr] = [];
        logsByDate[dateStr].push(data);
      });
      // For each date, compute averages
      const dates = Object.keys(logsByDate).sort();
      const bw = [];
      const hrs = [];
      const eff = [];
      const tgtHrs = [];
      dates.forEach(date => {
        const logs = logsByDate[date];
        // Average bandwidth
        const avgBw =
          logs.reduce((sum, l) => sum + (l.bandwidth || 0), 0) / logs.length;
        bw.push(avgBw);
        // Sum hours
        const sumHrs = logs.reduce(
          (sum, l) => sum + durationToHours(l.total_duration),
          0
        );
        hrs.push(sumHrs);
        // Average efficiency
        const avgEff =
          logs.reduce((sum, l) => sum + (l.efficiency || 0), 0) / logs.length;
        eff.push(avgEff);
        // Target (e.g. 8.5 hours/day)
        tgtHrs.push(8.5);
      });
      setLabels(dates);
      setBandwidthData(bw);
      setHoursData(hrs);
      setEfficiencyData(eff);
      setTargetHours(tgtHrs);
    }
    fetchLogs();
  }, [userId]);

  return (
    <>
      <BandwidthTrend data={bandwidthData} labels={labels} />
      <HoursVsTarget data={hoursData} target={targetHours} labels={labels} />
      <EfficiencyTrend data={efficiencyData} labels={labels} />
    </>
  );
}