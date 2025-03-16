import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import navigate hook
import "./profile.css"; // Import CSS file

function GetProfile() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [id, setId] = useState("");
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [patientPhone, setPatientPhone] = useState("");
  const [patientGender, setPatientGender] = useState("");
  const [patientAddress, setPatientAddress] = useState("");
  const [patientDob, setPatientDob] = useState("");
  const [profileImage, setProfileImage] = useState("");

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
          console.log("Fetched User Data:", data);
          setUser(data.user);
          setUsername(data.user.username);
          setId(data.user.id);
        } else {
          console.error("Failed to fetch user:", response.statusText);
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
    async function fetchPatientData() {
      if (!id) return;

      try {
        const response = await fetch(
          `http://localhost:8000/patient/getpatient/${id}`
        );
        if (!response.ok) {
          throw new Error("Patient not found!");
        }
        const patient = await response.json();
        setPatientPhone(patient.patient_phone);
        setPatientGender(patient.patient_gender);
        setPatientAddress(patient.patient_address);
        setPatientDob(patient.patient_dob.split("T")[0]);
        setProfileImage(patient.file || "default-profile.png");
      } catch (err) {
        console.error("Error fetching patient data:", err);
      }
    }

    fetchPatientData();
  }, [id]);

  const handleEdit = () => {
    navigate(`/editprofile`);
  };

  if (isLoading) {
    return <p>Loading profile...</p>;
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        {/* Profile Image */}
        <img src={profileImage} alt="Profile" className="profile-image" />
        <h2 className="profile-name">{username || "N/A"}</h2>

        {/* Contact Information */}
        <div className="profile-section">
          <h4 className="section-title">Contact Information</h4>
          <div className="profile-info">
            <span className="label">Phone:</span>
            <span className="value">{patientPhone || "N/A"}</span>
          </div>
          <div className="profile-info">
            <span className="label">Email:</span>
            <span className="value">{user?.email || "N/A"}</span>
          </div>
          <div className="profile-info">
            <span className="label">Address:</span>
            <span className="value">{patientAddress || "N/A"}</span>
          </div>
        </div>

        {/* Personal Information */}
        <div className="profile-section">
          <h4 className="section-title">Personal Information</h4>
          <div className="profile-info">
            <span className="label">Gender:</span>
            <span className="value">{patientGender || "N/A"}</span>
          </div>
          <div className="profile-info">
            <span className="label">Date of Birth:</span>
            <span className="value">{patientDob || "N/A"}</span>
          </div>
        </div>

        {/* Edit Button */}
        <button className="edit-btn" onClick={handleEdit}>
          Edit Profile
        </button>
      </div>
    </div>
  );
}

export default GetProfile;
