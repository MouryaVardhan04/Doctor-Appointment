import React, { useState } from 'react';
import './appoint.css';

function Appointment() {
  const sampleAppointments = [
    { id: 1, patient: 'Mourya Vardhan', age: 30, dateTime: '2025-03-12 10:00 AM', doctor: 'Dr. Mourya Vardhan', fees: '$50' },
    { id: 2, patient: 'Jane Doe', age: 28, dateTime: '2025-03-12 11:00 AM', doctor: 'Dr. Lee', fees: '$60' },
  ];

  // State to track appointments, search query, and filtered appointments
  const [appointments, setAppointments] = useState(sampleAppointments);
  const [searchQuery, setSearchQuery] = useState('');

  // Function to filter appointments based on patient and doctor name
  const filteredAppointments = appointments.filter((appointment) =>
    appointment.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
    appointment.doctor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleButtonClick = (id, action) => {
    setAppointments((prevAppointments) =>
      prevAppointments.map((appointment) =>
        appointment.id === id
          ? {
              ...appointment,
              status: action,
            }
          : appointment
      )
    );
  };

  return (
    <div className="appointments-container">
      <h1>Appointments</h1>
      <div className="topbar">
        <input
          type="text"
          placeholder="Search by patient or doctor..."
          className="search-bar"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <table>
        <thead>
          <tr>
            <th>S.No</th>
            <th>Patient</th>
            <th>Age</th>
            <th>Date & Time</th>
            <th>Doctor</th>
            <th>Fees</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredAppointments.map((appointment, index) => (
            <tr key={appointment.id}>
              <td>{index + 1}</td>
              <td>{appointment.patient}</td>
              <td>{appointment.age}</td>
              <td>{appointment.dateTime}</td>
              <td>{appointment.doctor}</td>
              <td>{appointment.fees}</td>
              <td>
                {appointment.status === 'cancelled' ? (
                  <p className="action-btn cancelled" onClick={() => handleButtonClick(appointment.id, 'cancelled')}>
                    &#10006; Cancelled
                  </p>
                ) : appointment.status === 'booked' ? (
                  <p className="action-btn booked" onClick={() => handleButtonClick(appointment.id, 'booked')}>
                    &#9989; Booked
                  </p>
                ) : (
                  <>
                    <button className="action-btn" onClick={() => handleButtonClick(appointment.id, 'booked')}>
                      &#9989; 
                    </button>
                    <button className="action-btn" onClick={() => handleButtonClick(appointment.id, 'cancelled')}>
                      &#10006; 
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Appointment;
