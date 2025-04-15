import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Doctor.css";
import Loading from "../Loading/loading";
import Notifi from "../Notification/notifi";

function Doctor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [image, setImage] = useState(null);
  const [doct_name, setDoctName] = useState("");
  const [doct_email, setDoctEmail] = useState("");
  const [doct_phone, setDoctPhone] = useState("");
  const [doct_specialization, setDoctSpecialization] = useState("");
  const [doct_degree, setDoctDegree] = useState("");
  const [doct_experience, setDoctExperience] = useState("");
  const [doct_consultationFees, setDoctConsultationFees] = useState("");
  const [doct_about, setDoctAbout] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [dates, setDates] = useState([]);
  const [times, setTimes] = useState([]);
  const [message, setMessage] = useState(null);
  const [type, setType] = useState("success");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookedSlots, setBookedSlots] = useState([]);

  useEffect(() => {
    async function fetchDoctorData() {
      try {
        const response = await fetch(`http://localhost:8000/admin/getdoctor/${id}`);
        if (!response.ok) throw new Error("Doctor not found!");

        const doctor = await response.json();
        setDoctName(doctor.doct_name);
        setDoctEmail(doctor.doct_email);
        setDoctPhone(doctor.doct_phone);
        setDoctSpecialization(doctor.doct_specialization);
        setDoctDegree(doctor.doct_degree);
        setDoctExperience(doctor.doct_experience);
        setDoctConsultationFees(doctor.doct_consultationFees);
        setDoctAbout(doctor.doct_about);
        setImage(doctor.file);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        setMessage("❌ Error fetching doctor data");
        setType("error");
        setTimeout(() => navigate("/admin/listdoctors"), 1000);
      }
    }
    fetchDoctorData();
  }, [id, navigate]);

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
    const generateNextFiveDays = () => {
      const today = new Date();
      const nextFiveDays = [];
      for (let i = 0; i < 5; i++) {
        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + i);
        const formattedDate = futureDate.toLocaleDateString("en-US", {
          weekday: "short",
          day: "numeric",
          month: "short"
        });
        nextFiveDays.push(formattedDate);
      }
      setDates(nextFiveDays);
    };

    const generateTimeSlots = () => {
      const timeSlots = [];
      let startHour = 10;
      let startMinute = 0;
      while (startHour < 16) {
        const timeString = `${String(startHour).padStart(2, "0")}:${String(startMinute).padStart(2, "0")}`;
        timeSlots.push(timeString);
        startMinute += 30;
        if (startMinute === 60) {
          startMinute = 0;
          startHour++;
        }
      }
      setTimes(timeSlots);
    };

    generateNextFiveDays();
    generateTimeSlots();
  }, []);

  useEffect(() => {
    const fetchBookedSlots = async () => {
      try {
        const response = await fetch(`http://localhost:8000/home/bookedAppointments/${id}`);
        if (response.ok) {
          const data = await response.json();
          setBookedSlots(data.appointments || []);
        }
      } catch (error) {
        console.error("Error fetching booked slots:", error);
      }
    };

    fetchBookedSlots();
  }, [id]);

  const handleDateSelect = (dateObj) => {
    setSelectedDate(dateObj.fullDate);
    setSelectedTime(null);
  };

  const isSlotBooked = (date, time) => {
    return bookedSlots.some(
      (slot) => slot.appoinment_date === date && slot.appoinment_time === time
    );
  };

  const bookAppointment = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Please log in to book an appointment.");
      navigate("/register");
      return;
    }

    const appointment = {
      patient_userId: user.id,
      doctor_id: id,
      appoinment_date: selectedDate,
      appoinment_time: selectedTime,
    };

    if (!appointment.appoinment_date || !appointment.appoinment_time) {
      alert("Please select a date and time.");
      return;
    }

    setBookingLoading(true);

    try {
      const response = await fetch("http://localhost:8000/home/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(appointment),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Booking failed");

      setMessage("✅ Appointment booked successfully!");
      setType("success");

      // Refresh booked slots after successful booking
      const slotsResponse = await fetch(`http://localhost:8000/home/bookedAppointments/${id}`);
      if (slotsResponse.ok) {
        const slotsData = await slotsResponse.json();
        setBookedSlots(slotsData.appointments || []);
      }

      // Navigate to patient report page with the appointment ID
      if (data.appointmentId) {
        navigate(`/patientreport/${data.appointmentId}`);
      } else {
        throw new Error("Appointment ID not received");
      }

    } catch (err) {
      setMessage(`❌ ${err.message}`);
      setType("error");
    } finally {
      setBookingLoading(false);
    }
  };

  const submitPatientProblem = async (appointmentId, problemDescription, files) => {
    try {
      const formData = new FormData();
      formData.append('problem_description', problemDescription);
      files.forEach(file => {
        formData.append('reports', file);
      });

      const response = await fetch(`http://localhost:8000/home/addpatientreport/${appointmentId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to submit problem');

      setMessage('✅ Problem report submitted successfully!');
      setType('success');
    } catch (err) {
      setMessage(`❌ ${err.message}`);
      setType('error');
    }
  };

  if (loading) return <div className="loading"><Loading /></div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <>
      {message && <Notifi message={message} onClose={() => setMessage(null)} type={type} />}
      {bookingLoading && (
        <div className="booking-loading">
          <span className="pulse-text">⏳ Please wait ...</span>
        </div>
      )}
      <div className="Doctor">
        <div className="get-doctor-details">
          <h1>Doctor Details</h1>
          <div className="get-doctor-container">
            <div className="get-doctor-info">
              <div className="get-doctor-left-right">
                <div className="get-doctor-left">
                  <p><strong>Name:</strong> {doct_name}</p>
                  <p><strong>Specialty:</strong> {doct_specialization}</p>
                  <p><strong>Phone:</strong> {doct_phone}</p>
                  <p><strong>Email:</strong> {doct_email}</p>
                  <p><strong>Degree:</strong> {doct_degree}</p>
                  <p><strong>Experience:</strong> {doct_experience} years</p>
                  <p><strong>Consultation Fees:</strong> ₹{doct_consultationFees}</p>
                </div>
                <div className="get-doctor-right">
                  <div className="get-doctor-image">
                    {image ? (
                      <img src={`http://localhost:8000/uploads/${image}`} alt={doct_name} />
                    ) : (
                      <p>No image available</p>
                    )}
                  </div>
                </div>
              </div>
              <p><strong>About:</strong> {doct_about}</p>
            </div>
          </div>
        </div>

        <div className="booking">
          <h1>Booking Slot</h1>
          <div className="date">
            {dates.map((date, index) => (
              <li
                key={index}
                className={`date-box ${selectedDate === date ? "selected" : ""}`}
                onClick={() => {
                  setSelectedDate(date);
                  setSelectedTime(null);
                }}
              >
                {date}
              </li>
            ))}
          </div>
          <div className="time">
            {times.map((time, index) => {
              const isBooked = selectedDate ? isSlotBooked(selectedDate, time) : false;
              return !isBooked ? (
                <li
                  key={index}
                  className={`time-box ${selectedTime === time ? "selected" : ""}`}
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </li>
              ) : null;
            })}
          </div>
        </div>

        <div className="book-app">
          <button onClick={bookAppointment} disabled={bookingLoading}>
            Book Appointment
          </button>
        </div>
      </div>
    </>
  );
}

export default Doctor;
