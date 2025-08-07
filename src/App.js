import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ProfilePanel from './components/ProfilePanel';
import LeaderboardTab from './components/LeaderboardTab';
import './App.css';

function App() {
  const [selectedTab, setSelectedTab] = useState('Employee Profile');
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Fetch employees from Firestore (use your firebase.js here)
  // You can use useEffect to fetch and set data

  return (
    <div className="dashboard-container">
      <div className="tabs">
        <button onClick={() => setSelectedTab('Employee Profile')}>Employee Profile</button>
        <button onClick={() => setSelectedTab('Leaderboard')}>Leaderboard</button>
      </div>
      <div className="main-panel">
        <Sidebar onEmployeeSelect={setSelectedEmployee} />
        {selectedTab === 'Employee Profile' ? (
          <ProfilePanel employee={selectedEmployee} />
        ) : (
          <LeaderboardTab />
        )}
      </div>
    </div>
  );
}

export default App;