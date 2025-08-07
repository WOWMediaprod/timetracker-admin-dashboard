import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, where } from "firebase/firestore";

const fallbackProfilePhoto = "https://ui-avatars.com/api/?name=User";
const currentWeekId = "2025-W32"; // You can dynamically generate this based on date
const currentMonthId = "2025-08"; // Also make this dynamic as needed

function LeaderboardTab() {
  const [data, setData] = useState([]);
  const [monthlyData, setMonthlyData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      try {
        // 1. Fetch all employee details
        const directoryRef = collection(db, "employee_directory");
        const directorySnapshot = await getDocs(directoryRef);
        const employeeMap = {};
        directorySnapshot.forEach(doc => {
          const d = doc.data();
          if (d.trello_id && d.trello_id.trim() !== "") {
            employeeMap[d.trello_id.trim()] = {
              name: d.name || d.trello_id.trim(),
              photo_url: d.photo_url || fallbackProfilePhoto
            };
          }
        });

        // 2. Fetch weekly points for the current week
        const q = query(
          collection(db, "weekly_points"),
          where("week_id", "==", currentWeekId)
        );
        const snapshot = await getDocs(q);
        const pointsMap = {};
        snapshot.forEach(doc => {
          const d = doc.data();
          pointsMap[d.user_id] = d.points || 0;
        });

        // 3. Fetch monthly stars for the current month
        const msQuery = query(collection(db, "monthly_stars"), where("month_id", "==", currentMonthId));
        const msSnap = await getDocs(msQuery);
        const monthlyMap = {};
        msSnap.forEach(doc => {
          const d = doc.data();
          monthlyMap[d.user_id] = {
            star_count: d.star_count || 0,
            badge_awarded: !!d.badge_awarded,
          };
        });
        setMonthlyData(monthlyMap);

        // 4. Build leaderboard: all employees, default points to 0 if not present
        const leaderboard = Object.entries(employeeMap)
          .map(([user_id, profile]) => ({
            name: profile.name,
            photo_url: profile.photo_url,
            points: pointsMap[user_id] !== undefined ? pointsMap[user_id] : 0,
            star_count: monthlyMap[user_id]?.star_count || 0,
            badge_awarded: !!monthlyMap[user_id]?.badge_awarded,
          }))
          .sort((a, b) => b.points - a.points);

        setData(leaderboard);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
        setData([]);
      }
      setLoading(false);
    }
    fetchLeaderboard();
  }, []);

  return (
    <div className="leaderboard-tab">
      <table className="leaderboard-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Photo</th>
            <th>Name</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={4} style={{textAlign:'center', padding:'32px'}}>Loading...</td>
            </tr>
          ) : (
            data.map((emp, idx) => (
              <tr key={emp.name + idx} className={idx < 3 ? 'top-rank-row' : ''}>
                <td>
                  <span className={`rank-badge rank-${idx+1}`}>{idx+1}</span>
                </td>
                <td>
                  <img
                    src={emp.photo_url || fallbackProfilePhoto}
                    alt={emp.name}
                    className="leaderboard-photo"
                    onError={e => { e.target.onerror = null; e.target.src = fallbackProfilePhoto; }}
                  />
                </td>
                <td>
                  <span>{emp.name}</span>
                  {emp.star_count > 0 && (
                    <span className="star-count" style={{marginLeft: 8, color: '#f5c842', fontSize: '1.2em'}}>
                      {Array(emp.star_count).fill('⭐').join('')}
                    </span>
                  )}
                  {emp.badge_awarded && (
                    <span className="badge" style={{marginLeft: 6, fontSize: '1.2em'}}>🏅</span>
                  )}
                </td>
                <td><span className="points-badge">{emp.points}</span></td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default LeaderboardTab;