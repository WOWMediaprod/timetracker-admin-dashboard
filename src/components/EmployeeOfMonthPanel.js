import React, { useEffect, useState } from 'react';
import { db } from './firebase';
import { collection, query, where, getDocs } from "firebase/firestore";

function EmployeeOfMonthPanel({ year, month }) {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMonthlyStars() {
      setLoading(true);
      const monthId = `${year}-${month.toString().padStart(2, '0')}`;
      const q = query(
        collection(db, "monthly_stars"),
        where("month_id", "==", monthId),
        where("badge_awarded", "==", true)
      );
      const snap = await getDocs(q);
      const winnersArr = [];
      snap.forEach(doc => {
        const d = doc.data();
        winnersArr.push(d);
      });
      setWinners(winnersArr);
      setLoading(false);
    }
    fetchMonthlyStars();
  }, [year, month]);

  if (loading) return <div>Loading...</div>;
  if (winners.length === 0) return <div>No Employee of the Month yet!</div>;

  return (
    <div className="employee-month-panel">
      <h3>Employee of the Month ({year}-{month.toString().padStart(2, '0')})</h3>
      {winners.map((w, idx) => (
        <div key={w.user_id} className="winner-card">
          <span className="winner-name">{w.name}</span>
          <span className="winner-stars">{'⭐'.repeat(w.star_count)}</span>
        </div>
      ))}
    </div>
  );
}

export default EmployeeOfMonthPanel;