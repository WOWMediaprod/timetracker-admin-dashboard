import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ProfilePanel from './components/ProfilePanel';
import LeaderboardTab from './components/LeaderboardTab';
import './App.css';

function App() {
  const [selectedTab, setSelectedTab] = useState('Employee Profile');
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  return (
    <div className="dashboard-container">
      <div className="tabs">
        <button
          className={selectedTab === 'Employee Profile' ? 'active' : ''}
          onClick={() => setSelectedTab('Employee Profile')}
        >
          Employee Profile
        </button>
        <button
          className={selectedTab === 'Leaderboard' ? 'active' : ''}
          onClick={() => setSelectedTab('Leaderboard')}
        >
          Leaderboard
        </button>
      </div>
      <div className="main-panel">
        <Sidebar onEmployeeSelect={setSelectedEmployee} selectedEmployee={selectedEmployee} />
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