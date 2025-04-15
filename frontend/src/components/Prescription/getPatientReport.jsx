import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './getPatientReport.css';
import { FaNotesMedical } from 'react-icons/fa';

function GetPatientReport() {
    const { id: AppointmentId } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [patientPhone, setPatientPhone] = useState("");
    const [patientGender, setPatientGender] = useState("");
    const [patientAddress, setPatientAddress] = useState("");
    const [patientDob, setPatientDob] = useState("");
    const [profileImage, setProfileImage] = useState("");
    const [email, setEmail] = useState("");
    const [patientProblem, setPatientProblem] = useState("");
    const [patientReports, setPatientReports] = useState([]);
    const [age, setAge] = useState(0);
    const [fullName, setFullName] = useState("");
    const [error, setError] = useState(null);
    const [appointmentDate, setAppointmentDate] = useState("");
    const [appointmentTime, setAppointmentTime] = useState("");

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
        async function fetchPatientReport() {
            if (!AppointmentId) {
                setError("Appointment ID is required");
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch(`http://localhost:8000/admin/getpatientreport/${AppointmentId}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch patient report");
                }
                const data = await response.json();

                if (!data.report || !data.patient) {
                    throw new Error("Invalid data received from server");
                }

                // Set patient data
                const patient = data.patient;
                setFullName(patient.patient_name);
                setPatientPhone(patient.patient_phone);
                setPatientGender(patient.patient_gender);
                setPatientAddress(patient.patient_address);
                setPatientDob(patient.patient_dob);
                setEmail(patient.patient_email);
                setProfileImage(patient.file || "default-profile.png");
                setAge(calculateAge(patient.patient_dob));

                // Set report data
                if (data.report) {
                    setPatientProblem(data.report.problem_description || "No problem description available");
                    setPatientReports(data.report.reports || []);
                }

                // Set appointment details
                const appointment_details = data.appointment;
                setAppointmentDate(appointment_details.appoinment_date);
                setAppointmentTime(appointment_details.appoinment_time);

            } catch (err) {
                console.error("Error fetching data:", err);
                setError(err.message || "Failed to fetch data. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        }

        fetchPatientReport();
    }, [AppointmentId]);

    // Function to handle navigation
    const handleAddPrescription = () => {
        navigate(`/postDoctPres/${AppointmentId}`);
    };

    if (isLoading) {
        return <div className="loading">Loading patient information...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="patient-report-container">
            {/* Patient Header */}
            <div className="patient-header">
                <img 
                    src={profileImage === "default-profile.png" 
                        ? "/default-profile.png" 
                        : profileImage} 
                    alt="Profile" 
                    className="profile-image"
                    onError={(e) => {
                        e.target.src = "/default-profile.png";
                    }}
                />
                <div className="patient-info">
                    <h1 className="patient-name">{fullName}</h1>
                </div>
            </div>



            {/* Patient Information Cards */}
            <div className="info-section">
                <div className="info-card">
                    <h2 className="card-title">Contact Information</h2>
                    <div className="card-content">
                        <p><strong>Phone:</strong> <span>{patientPhone}</span></p>
                        <p><strong>Email:</strong> <span>{email}</span></p>
                        <p><strong>Address:</strong> <span>{patientAddress}</span></p>
                    </div>
                </div>

                <div className="info-card">
                    <h2 className="card-title">Personal Details</h2>
                    <div className="card-content">
                        <p><strong>Gender:</strong> <span>{patientGender}</span></p>
                        <p><strong>Date of Birth:</strong> <span>{patientDob ? new Date(patientDob).toLocaleDateString() : 'N/A'}</span></p>
                        <p><strong>Age:</strong> <span>{age} years</span></p>
                    </div>
                </div>

                <div className="info-card">
                    <h2 className="card-title">Appointment Details</h2>
                    <div className="card-content">
                        <p><strong>Appointment ID:</strong> <span>{AppointmentId}</span></p>
                        <p><strong>Date:</strong> <span>{appointmentDate ? new Date(appointmentDate).toLocaleDateString() : 'N/A'}</span></p>
                        <p><strong>Time:</strong> <span>{appointmentTime}</span></p>
                    </div>
                </div>
            </div>

            {/* Problem Description */}
            <div className="problem-section">
                <h2 className="problem-title">Problem Description</h2>
                <p className="problem-description">{patientProblem}</p>
            </div>

            {/* Reports Section */}
            {patientReports && patientReports.length > 0 ? (
                <div className="reports-section">
                    <h2 className="reports-title">Medical Reports</h2>
                    <div className="reports-grid">
                        {patientReports.map((report, index) => (
                            <div key={index} className="report-item">
                                <img 
                                    src={`http://localhost:8000/uploads/patient_reports/${report.filename}`} 
                                    alt={`Report ${index + 1}`} 
                                    className="report-image"
                                    onError={(e) => {
                                        e.target.src = "/default-report.png";
                                    }}
                                />
                                <div className="report-overlay">
                                    Report {index + 1}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="reports-section">
                    <h2 className="reports-title">Medical Reports</h2>
                    <p className="no-reports">No medical reports available</p>
                </div>
            )}
                        {/* Button to Add Prescription */}
                        <div className="add-prescription-section">
                <button onClick={handleAddPrescription} className="add-prescription-btn">
                    <FaNotesMedical /> Add Prescription
                </button>
            </div>
        </div>
    );
}

export default GetPatientReport;
