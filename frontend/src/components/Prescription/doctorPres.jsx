import React, { useState, useEffect } from 'react';
import { FaUser, FaCalendarAlt, FaPills, FaPlus, FaTrash, FaCheck, FaSun, FaMoon, FaPhone, FaEnvelope, FaMapMarkerAlt, FaBirthdayCake, FaUserMd } from 'react-icons/fa';
import './doctorPres.css';
import { useParams } from 'react-router-dom';

function DoctorPres() {
  const { id: appointmentId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [patientDetails, setPatientDetails] = useState({
    name: "",
    phone: "",
    gender: "",
    address: "",
    dob: "",
    email: "",
    age: 0,
    userId: null
  });
  const [doctorDetails, setDoctorDetails] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    id: null
  });
  const [appointmentDetails, setAppointmentDetails] = useState({
    date: "",
    time: ""
  });
  const [error, setError] = useState(null);

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    async function fetchAppointmentDetails() {
      if (!appointmentId) {
        setError("Appointment ID is required");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:8000/admin/getpatientreport/${appointmentId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch appointment details");
        }
        const data = await response.json();

        // Set patient data
        const patient = data.patient;
        setPatientDetails({
          name: patient.patient_name,
          phone: patient.patient_phone,
          gender: patient.patient_gender,
          address: patient.patient_address,
          email: patient.patient_email,
          dob: patient.patient_dob,
          age: calculateAge(patient.patient_dob),
          userId: patient.patient_userId
        });

        // Set doctor data
        const doctor = data.doctor;
        setDoctorDetails({
          name: doctor.doct_name,
          email: doctor.doct_email,
          phone: doctor.doct_phone,
          specialization: doctor.doct_specialization,
          id: doctor._id
        });

        // Set appointment data
        const appointment = data.appointment;
        setAppointmentDetails({
          date: appointment.appoinment_date,
          time: appointment.appoinment_time
        });

      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to fetch data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchAppointmentDetails();
  }, [appointmentId]);

  const [prescription, setPrescription] = useState({
    diagnosis: '',
    medications: [{ name: '', dosage: '', duration: '', timing: 'Morning' }],
    instructions: '',
    followUp: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPrescription(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMedicationChange = (index, field, value) => {
    const updatedMedications = [...prescription.medications];
    updatedMedications[index] = {
      ...updatedMedications[index],
      [field]: value
    };
    setPrescription(prev => ({
      ...prev,
      medications: updatedMedications
    }));
  };

  const addMedication = () => {
    setPrescription(prev => ({
      ...prev,
      medications: [...prev.medications, { name: '', dosage: '', duration: '', timing: 'Morning' }]
    }));
  };

  const removeMedication = (index) => {
    const updatedMedications = prescription.medications.filter((_, i) => i !== index);
    setPrescription(prev => ({
      ...prev,
      medications: updatedMedications
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload = {
        appointmentId: appointmentId,
        patient_userId: patientDetails.userId,
        doctor_id: doctorDetails.id,
        patientName: patientDetails.name,
        age: patientDetails.age,
        gender: patientDetails.gender,
        diagnosis: prescription.diagnosis,
        medications: prescription.medications,
        instructions: prescription.instructions,
        followUp: prescription.followUp
      };

      console.log("Submitting Payload:", payload);

      const response = await fetch(`http://localhost:8000/admin/doctorPrescription/${appointmentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to submit prescription');
      }

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error submitting prescription:', error);
      setError(error.message || 'Failed to submit prescription. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="prescription-container">
      {/* Conditionally render submission message at the top */}
      {isSubmitting && (
        <div className="submission-message-popup">
          Please wait...
        </div>
      )}

      {/* Display Fetch Error if exists */} 
      {error && !isSubmitting && <div className="error">Error fetching details: {error}</div>}

      {/* Details Section with Two Columns */}
      <div className="details-layout">
        {/* Left Column: Patient Details */}
        <div className="details-column-left">
          <h3><FaUser /> Patient Information</h3>
          <table className="details-table">
            <tbody>
              <tr><th>Name:</th><td>{patientDetails.name}</td></tr>
              <tr><th>Age:</th><td>{patientDetails.age} years</td></tr>
              <tr><th>Gender:</th><td>{patientDetails.gender}</td></tr>
              <tr><th>DOB:</th><td>{patientDetails.dob}</td></tr>
              <tr><th><FaPhone /> Phone:</th><td>{patientDetails.phone}</td></tr>
              <tr><th><FaEnvelope /> Email:</th><td>{patientDetails.email}</td></tr>
              <tr><th><FaMapMarkerAlt /> Address:</th><td>{patientDetails.address}</td></tr>
            </tbody>
          </table>
        </div>

        {/* Right Column: Doctor & Appointment Details */}
        <div className="details-column-right">
          {/* Doctor Details Table */}
          <h3><FaUserMd /> Doctor Information</h3>
          <table className="details-table">
            <tbody>
              <tr><th>Name:</th><td>{doctorDetails.name}</td></tr>
              <tr><th>Specialization:</th><td>{doctorDetails.specialization}</td></tr>
              {/* Add Doctor Phone/Email if available and needed */}
              {/* <tr><th><FaPhone /> Phone:</th><td>{doctorDetails.phone}</td></tr> */} 
              {/* <tr><th><FaEnvelope /> Email:</th><td>{doctorDetails.email}</td></tr> */} 
            </tbody>
          </table>

          {/* Appointment Details Table */}
          <h3><FaCalendarAlt /> Appointment Details</h3>
          <table className="details-table">
            <tbody>
              <tr><th> ID:</th><td>{appointmentId}</td></tr>
              <tr><th>Date:</th><td>{appointmentDetails.date}</td></tr>
              <tr><th>Time:</th><td>{appointmentDetails.time}</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Prescription Form Starts Here */}
      <hr className="section-divider" />
      <h2>Doctor's Prescription</h2>
      {/* Display Submission Error if exists */} 
      {error && <div className="error">Submission Error: {error}</div>}
      
      <form onSubmit={handleSubmit} className="prescription-form">
        <div className="form-group">
          <label>Diagnosis</label>
          <textarea
            name="diagnosis"
            value={prescription.diagnosis}
            onChange={handleChange}
            placeholder="Enter diagnosis details"
            required
            rows="3"
          />
        </div>

        <div className="medications-section">
          <h3>Medications</h3>
          {prescription.medications.map((med, index) => (
            <div key={index} className="medication-row">
              <div className="form-group">
                <label>Medicine Name</label>
                <input
                  type="text"
                  value={med.name}
                  onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                  placeholder="Enter medicine name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Dosage</label>
                <input
                  type="text"
                  value={med.dosage}
                  onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                  placeholder="e.g., 500mg, 1 tablet"
                  required
                />
              </div>
              <div className="form-group">
                <label>Duration</label>
                <input
                  type="text"
                  value={med.duration}
                  onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                  placeholder="e.g., 7 days, 1 month"
                  required
                />
              </div>
              <div className="form-group timing-group">
                <label>Timing</label>
                <select
                  value={med.timing}
                  onChange={(e) => handleMedicationChange(index, 'timing', e.target.value)}
                  className="timing-select"
                >
                  <option value="Early Morning"><FaSun /> Early Morning</option>
                  <option value="Morning"><FaSun /> Morning</option>
                  <option value="Afternoon"><FaSun /> Afternoon</option>
                  <option value="Night"><FaMoon /> Night</option>
                  <option value="Morning & Night"><FaSun /> Morning & Night</option>
                  <option value="Morning, Afternoon & Night"><FaSun /> Morning, Afternoon & Night</option>
                </select>
              </div>
              {prescription.medications.length > 1 && (
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => removeMedication(index)}
                >
                  <FaTrash /> 
                </button>
              )}
            </div>
          ))}
          <button type="button" className="add-btn" onClick={addMedication}>
            <FaPlus /> Add Medication
          </button>
        </div>

        <div className="form-group">
          <label>Instructions</label>
          <textarea
            name="instructions"
            value={prescription.instructions}
            onChange={handleChange}
            placeholder="Enter any additional instructions (diet, advice, etc.)"
            rows="3"
          />
        </div>

        <div className="form-group">
          <label><FaCalendarAlt /> Follow-up Date</label>
          <input
            type="date"
            name="followUp"
            value={prescription.followUp}
            onChange={handleChange}
          />
        </div>

        <button 
          type="submit" 
          className="submit-btn"
          disabled={isSubmitting}
        >
           Submit Prescription
        </button>

        {showSuccess && (
          <div className="success-message">
            Prescription submitted successfully!
          </div>
        )}
      </form>
    </div>
  );
}

export default DoctorPres;
