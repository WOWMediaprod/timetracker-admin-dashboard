import { db } from './firebase';
import { collection, query, where, getDocs, setDoc, doc } from "firebase/firestore";

// Utility: get all ISO weeks for a month
function getWeeksForMonth(year, month) {
  // Generates all week_ids for the given year/month (e.g. "2025-08" => ["2025-W31", ...])
  const weeks = [];
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  let week = getISOWeek(firstDay);
  let weekId = `${year}-W${week.toString().padStart(2, '0')}`;
  weeks.push(weekId);
  for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 7)) {
    week = getISOWeek(d);
    weekId = `${d.getFullYear()}-W${week.toString().padStart(2, '0')}`;
    if (!weeks.includes(weekId)) weeks.push(weekId);
  }
  return weeks;
}

// Helper: Get ISO week number
function getISOWeek(date) {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  return 1 + Math.ceil((firstThursday - target) / 604800000);
}

// Main: Compute and store monthly stars
export async function updateMonthlyStars(year, month) {
  const monthId = `${year}-${month.toString().padStart(2, '0')}`;
  const weeks = getWeeksForMonth(year, month);

  // Step 1: Aggregate weekly winners
  const starCounts = {}; // user_id -> star_count
  for (const weekId of weeks) {
    const q = query(collection(db, "weekly_points"), where("week_id", "==", weekId));
    const snap = await getDocs(q);
    let weekMax = -Infinity;
    let weekWinners = [];
    snap.forEach(doc => {
      const d = doc.data();
      if (d.points > weekMax) {
        weekMax = d.points;
        weekWinners = [d.user_id];
      } else if (d.points === weekMax) {
        weekWinners.push(d.user_id);
      }
    });
    weekWinners.forEach(uid => {
      starCounts[uid] = (starCounts[uid] || 0) + 1;
    });
  }

  // Step 2: Find top user(s)
  const maxStars = Math.max(...Object.values(starCounts));
  const topUsers = Object.keys(starCounts).filter(uid => starCounts[uid] === maxStars);

  // Step 3: Store data in monthly_stars
  const directorySnap = await getDocs(collection(db, "employee_directory"));
  const employeeMap = {};
  directorySnap.forEach(doc => {
    const d = doc.data();
    employeeMap[d.trello_id] = d.name;
  });

  for (const uid of Object.keys(starCounts)) {
    await setDoc(doc(db, "monthly_stars", `${uid}_${monthId}`), {
      user_id: uid,
      name: employeeMap[uid] || uid,
      month_id: monthId,
      star_count: starCounts[uid],
      badge_awarded: topUsers.includes(uid),
      timestamp: new Date()
    });
  }
}