import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

function LeaderboardTab() {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    async function fetchLeaderboard() {
      const querySnapshot = await getDocs(collection(db, "weekly_points"));
      const data = [];
      querySnapshot.forEach((doc) => {
        const row = doc.data();
        data.push({
          name: row.user_id, // You may need to look up the name from employee_directory
          points: row.points,
          photo: '', // Load from employee_directory if needed
        });
      });
      setLeaderboard(data);
    }
    fetchLeaderboard();
  }, []);

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Photo</th>
            <th>Name</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard
            .sort((a, b) => b.points - a.points)
            .map((emp, idx) => (
              <tr key={emp.name}>
                <td>{idx + 1}</td>
                <td><img src={emp.photo} alt="Profile" style={{ width: 32, height: 32, borderRadius: '4px' }} /></td>
                <td>{emp.name}</td>
                <td>{emp.points}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export default LeaderboardTab;