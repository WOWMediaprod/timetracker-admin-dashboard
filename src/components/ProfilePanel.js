import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import PercentageDial from './PercentageDial';

function ProfilePanel({ employee }) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!employee) return;
    async function fetchProfile() {
      const q = query(collection(db, "employee_directory"), where("name", "==", employee));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        setProfile(doc.data());
      });
    }
    fetchProfile();
  }, [employee]);

  if (!employee) return <div>Select an employee</div>;
  if (!profile) return <div>Loading...</div>;

  return (
    <div className="profile-panel">
      <img src={profile.photo_url} alt="Profile" className="profile-photo" />
      <div className="metrics">
        <PercentageDial value={profile.bandwidth || 0} label="Bandwidth" />
        <PercentageDial value={profile.efficiency || 0} label="Efficiency" />
      </div>
      <div>Name: {profile.name}</div>
      <div>ID: {profile.trello_id}</div>
      <div>Joined: {profile.join_date}</div>
      {/* More stats as needed */}
    </div>
  );
}
export default ProfilePanel;