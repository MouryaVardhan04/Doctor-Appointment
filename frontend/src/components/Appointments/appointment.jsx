import React, { useState, useEffect } from 'react';
import './appoint.css';

function Appointment() {
  const [appointments, setAppointments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch appointments from backend
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch("http://localhost:8000/admin/adminAppoint"); // Adjust the API URL if needed
        const data = await response.json();
        setAppointments(data);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };
    fetchAppointments();
  }, []);

  // Function to update appointment status
  const handleButtonClick = async (id, action) => {
    try {
      const response = await fetch(`http://localhost:8000/admin/acceptAppointment/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointment_status: action }),
      });

      if (!response.ok) {
        throw new Error("Failed to update appointment status");
      }

      // Update local state after successful API call
      setAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment._id === id ? { ...appointment, appointment_status: action } : appointment
        )
      );
    } catch (error) {
      console.error("Error updating appointment status:", error);
    }
  };

  // Filter appointments based on search query
  const filteredAppointments = appointments.filter(
    (appointment) =>
      appointment.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.doctor_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <th>DOB</th>
            <th>Date & Time</th>
            <th>Doctor</th>
            <th>Fees</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredAppointments.map((appointment, index) => (
            <tr key={appointment.appointment_id}>
              <td>{index + 1}</td>
              <td>{appointment.patient_name}</td>
              <td>{appointment.patient_dob || "N/A"}</td>
              <td>{appointment.appointment_date} {appointment.appointment_time}</td>
              <td>{appointment.doctor_name}</td>
              <td>{appointment.doct_consultationFees}</td>
              <td>
              {appointment.appointment_status === 'Rejected' ? (
                  <p className="action-btn cancelled">&#10006; Rejected</p>
                ) : appointment.appointment_status === 'Accepted' ? (
                  <p className="action-btn booked">&#9989; Accepted</p>
                ) : (
                  <>
                    <button className="action-btn" onClick={() => handleButtonClick(appointment.appointment_id, 'Accepted')}>
                      &#9989;
                    </button>
                    <button className="action-btn" onClick={() => handleButtonClick(appointment.appointment_id, 'Rejected')}>
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
