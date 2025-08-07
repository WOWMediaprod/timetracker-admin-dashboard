import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

function Sidebar({ onEmployeeSelect }) {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    async function fetchEmployees() {
      const querySnapshot = await getDocs(collection(db, "employee_directory"));
      const employeeList = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.name) employeeList.push(data.name);
      });
      setEmployees(employeeList);
    }
    fetchEmployees();
  }, []);

  return (
    <div className="sidebar">
      <ul>
        {employees.map(emp => (
          <li key={emp} onClick={() => onEmployeeSelect(emp)}>{emp}</li>
        ))}
      </ul>
      <button>Refresh Data</button>
      <button>Quit</button>
    </div>
  );
}

export default Sidebar;