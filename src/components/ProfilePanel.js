import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from "firebase/firestore";
import PercentageDial from './PercentageDial';
import BandwidthTrend from './BandwidthTrend';
import EfficiencyTrend from './EfficiencyTrend';
import HoursVsTarget from './HoursVsTarget';
import Chart from 'chart.js/auto';
import CurvedProgressBar from './CurvedProgressBar';

const fallbackProfilePhoto = "https://ui-avatars.com/api/?name=Profile";

function renderDate(ts) {
  if (!ts) return '';
  if (typeof ts === 'object' && ts.seconds) {
    return new Date(ts.seconds * 1000).toLocaleDateString();
  }
  if (ts.toDate) {
    return ts.toDate().toLocaleDateString();
  }
  return String(ts);
}

function ProfilePanel({ employee }) {
  const [metrics, setMetrics] = useState({ bandwidth: 0, efficiency: 0, totalWork: '0h 0m 0s' });
  const [activeTab, setActiveTab] = useState('bandwidth');
  const [timeframe, setTimeframe] = useState('Daily');
  const [photoSrc, setPhotoSrc] = useState(employee?.photo_url || fallbackProfilePhoto);

  useEffect(() => {
    setPhotoSrc(employee?.photo_url || fallbackProfilePhoto);
  }, [employee]);

  useEffect(() => {
    if (!employee) return;
    async function fetchMetrics() {
      const q = query(
        collection(db, "work_logs"),
        where("user_id", "==", employee.trello_id)
      );
      const snapshot = await getDocs(q);

      let bandwidthSum = 0, bandwidthCount = 0;
      let efficiencySum = 0, efficiencyCount = 0;
      let totalSeconds = 0;

      snapshot.forEach(doc => {
        const data = doc.data();
        if (typeof data.bandwidth === "number") {
          bandwidthSum += data.bandwidth;
          bandwidthCount++;
        }
        if (typeof data.efficiency === "number") {
          efficiencySum += data.efficiency;
          efficiencyCount++;
        }
        if (data.total_duration) {
          const m = data.total_duration.match(/(\d+)h\s*(\d+)m\s*(\d+)s/);
          if (m) {
            totalSeconds += (+m[1] || 0) * 3600 + (+m[2] || 0) * 60 + (+m[3] || 0);
          }
        }
      });

      setMetrics({
        bandwidth: bandwidthCount ? Math.round(bandwidthSum / bandwidthCount) : 0,
        efficiency: efficiencyCount ? Math.round(efficiencySum / efficiencyCount) : 0,
        totalWork: `${Math.floor(totalSeconds / 3600)}h ${Math.floor((totalSeconds % 3600) / 60)}m ${totalSeconds % 60}s`
      });
    }
    fetchMetrics();
  }, [employee]);

  if (!employee) return <div>Select an employee</div>;

  return (
    <div className="profile-panel profile-panel-card">
      <img
        src={photoSrc}
        alt={employee?.name ? `${employee.name} Profile Photo` : "Profile"}
        className="profile-photo large-photo"
        onError={() => setPhotoSrc(fallbackProfilePhoto)}
      />
      <div className="metrics dial-row">
        <CurvedProgressBar value={metrics.bandwidth} label="Bandwidth" />
        <CurvedProgressBar value={metrics.efficiency} label="Efficiency" />
      </div>
      <div className="profile-details">
        <div className="detail-row">
          <span className="detail-label">Name:</span>
          <span className="detail-value">{employee.name}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Trello ID:</span>
          <span className="detail-value">{employee.trello_id}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Joined:</span>
          <span className="detail-value">{renderDate(employee.join_date)}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Total Work:</span>
          <span className="detail-value">{metrics.totalWork}</span>
        </div>
        <div className="detail-row detail-timeframe">
          <label className="detail-label">Timeframe:</label>
          <select value={timeframe} onChange={e => setTimeframe(e.target.value)}>
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
          </select>
        </div>
      </div>
      {/* Chart tabs and chart container as before */}
      <div className="charts">
        <div className="tab-bar chart-tabs">
          <button
            className={activeTab === 'bandwidth' ? 'chart-active' : ''}
            onClick={() => setActiveTab('bandwidth')}
          >Bandwidth Trend</button>
          <button
            className={activeTab === 'hours' ? 'chart-active' : ''}
            onClick={() => setActiveTab('hours')}
          >Hours vs Target</button>
          <button
            className={activeTab === 'efficiency' ? 'chart-active' : ''}
            onClick={() => setActiveTab('efficiency')}
          >Efficiency Trend</button>
        </div>
        <div className="chart-content">
          {activeTab === 'bandwidth' && (
            <div className="chart-container chart-dynamic">
              <BandwidthTrend employee={employee} timeframe={timeframe} />
            </div>
          )}
          {activeTab === 'hours' && (
            <div className="chart-container chart-dynamic">
              <HoursVsTarget employee={employee} timeframe={timeframe} />
            </div>
          )}
          {activeTab === 'efficiency' && (
            <div className="chart-container chart-dynamic">
              <EfficiencyTrend employee={employee} timeframe={timeframe} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePanel;