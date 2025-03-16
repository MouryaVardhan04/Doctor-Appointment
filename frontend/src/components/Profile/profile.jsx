import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./profile.css";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [patient_name, setPatient_name] = useState("");
  const [patient_phone, setPatient_phone] = useState("");
  const [patient_gender, setPatient_gender] = useState("");
  const [patient_address, setPatient_address] = useState("");
  const [patient_dob, setPatient_dob] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch("http://localhost:8000/auth/user", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token") || ""}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          console.error("Failed to fetch user data");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUser();
  }, []);

  async function newPatient(ev) {
    ev.preventDefault();

    if (!user) {
      alert("User data is still loading. Please wait.");
      return;
    }

    if (!patient_name || !patient_phone || !patient_gender || !patient_address || !patient_dob) {
      alert("Please fill in all required fields.");
      return;
    }

    const formData = new FormData();
    formData.append("patient_userId", user.id);
    formData.append("patient_name", patient_name);
    formData.append("patient_email", user.email);
    formData.append("patient_phone", patient_phone);
    formData.append("patient_gender", patient_gender);
    formData.append("patient_address", patient_address);
    formData.append("patient_dob", patient_dob);
    if (file) formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/patient/addpatient", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (response.ok) {
        alert("Patient Profile Created Successfully!");
        setPatient_name("");
        setPatient_phone("");
        setPatient_gender("");
        setPatient_address("");
        setPatient_dob("");
        setFile(null);
        setPreview(null);
        navigate("/");
      } else {
        const data = await response.json();
        alert(`Failed to create profile: ${data.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error creating profile:", error);
      alert("Network error! Please check server connection.");
    }
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
    }
  };

  return (
    <div className="patient-container">
      {isLoading ? (
        <p>Loading user data...</p>
      ) : user ? (
        <>
          <h2>Patient Profile</h2>
          <form onSubmit={newPatient}>
            <div className="file-input">
              <input type="file" accept="image/*" onChange={handleFileChange} />
              {preview && (
                <div className="image-preview">
                  <img src={preview} alt="Preview" />
                </div>
              )}
            </div>

            <input
              type="text"
              placeholder="Name"
              value={patient_name}
              onChange={(e) => setPatient_name(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Phone"
              value={patient_phone}
              onChange={(e) => setPatient_phone(e.target.value)}
              required
            />
            <select
              value={patient_gender}
              onChange={(e) => setPatient_gender(e.target.value)}
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <input
              type="text"
              placeholder="Address"
              value={patient_address}
              onChange={(e) => setPatient_address(e.target.value)}
              required
            />
            <input
              type="date"
              value={patient_dob}
              onChange={(e) => setPatient_dob(e.target.value)}
              required
            />
            <button type="submit" disabled={!user}>Save Profile</button>
          </form>
        </>
      ) : (
        <p>User data not found. Please log in again.</p>
      )}
    </div>
  );
}

export default Profile;
