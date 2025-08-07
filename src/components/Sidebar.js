import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

function Sidebar({ onEmployeeSelect, selectedEmployee }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch employees on mount
  useEffect(() => {
    async function fetchEmployees() {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "employee_directory"));
        const employeeList = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          employeeList.push(data);
        });
        setEmployees(employeeList);
        setLoading(false);
        // Optional: select first employee by default
        if (employeeList.length && !selectedEmployee) {
          onEmployeeSelect(employeeList[0]);
        }
      } catch (err) {
        setLoading(false);
        console.error("Error loading employees:", err);
      }
    }
    fetchEmployees();
  }, [onEmployeeSelect, selectedEmployee]);

  return (
    <div className="sidebar">
      <ul>
        {loading && <li>Loading...</li>}
        {!loading && employees.length === 0 && <li>No employees found</li>}
        {!loading && employees.map(emp => (
          <li
            key={emp.trello_id || emp.name}
            className={selectedEmployee && emp.trello_id === selectedEmployee.trello_id ? "selected" : ""}
            onClick={() => onEmployeeSelect(emp)}
          >
            {emp.name}
          </li>
        ))}
      </ul>
      <button>Refresh Data</button>
      <button>Quit</button>
    </div>
  );
}

export default Sidebar;