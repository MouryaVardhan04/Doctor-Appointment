import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./appoint.css";
import Loading from "../Loading/loading";

function PatientAppoint() {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [loadingId, setLoadingId] = useState(null); // Track which appointment is being deleted
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch("http://localhost:8000/auth/user", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          console.error("Failed to fetch user");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUser();
  }, []);

  useEffect(() => {
    if (!user) return; // Ensure user is set before fetching appointments

    async function fetchAppointments(patientId) {
      if (!patientId) return;

      try {
        const response = await fetch(`http://localhost:8000/home/displayappoint/${patientId}`);
        if (response.ok) {
          const data = await response.json();
          console.log(data);
          setAppointments(data);
        } else {
          console.error("Failed to fetch appointments");
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    }

    if (user?.id) fetchAppointments(user.id);
  }, [user]); // Runs when `user` is updated

  const handleDelete = async (appointId) => {
    setLoadingId(appointId); // Disable button for this appointment

    try {
      const response = await fetch(`http://localhost:8000/home/deleteappoint/${appointId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });

      if (response.ok) {
        setAppointments((prevAppointments) => prevAppointments.filter((a) => a.appointment_id !== appointId));
      } else {
        console.error("Failed to delete appointment");
      }
    } catch (error) {
      console.error("Error deleting appointment:", error);
    } finally {
      setLoadingId(null); // Re-enable button
    }
  };

  const handlePayment = (appointmentId) => {
    navigate(`/payment/${appointmentId}`);
  };

  return (
    <div className="appointment-container">
      <h2>My Appointments</h2>
      {isLoading ? (
        <Loading />
      ) : appointments.length > 0 ? (
        <table className="appointment-table">
          <thead>
            <tr>
              <th>Doctor Name</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Fees</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment, index) => (
              <tr key={appointment.appointment_id ?? `temp-${index}`}>
                <td>{appointment.doctor_name}</td>
                <td>{appointment.appointment_date}</td>
                <td>{appointment.appointment_time}</td>
                <td>{appointment.appointment_status}</td>
                <td>₹{appointment.doct_consultationFees}</td>
                <td>
                  <button
                    className="cancelbtn"
                    onClick={() => handleDelete(appointment.appointment_id)}
                    disabled={loadingId === appointment.appointment_id}
                  >
                    {loadingId === appointment.appointment_id ? "Cancelling..." : "Cancel"}
                  </button>
                  {appointment.appointment_status !== "Paid" && (
                    <button 
                      className="Paymentbtn"
                      onClick={() => handlePayment(appointment.appointment_id)}
                    >
                      Pay Now
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No appointments found.</p>
      )}
    </div>
  );
}

export default PatientAppoint;
