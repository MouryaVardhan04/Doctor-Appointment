import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./profile.css"; // Import CSS file

function EditProfile() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [id, setId] = useState("");
  const [patient_phone, setPatientPhone] = useState("");
  const [patient_gender, setPatientGender] = useState("");
  const [patient_address, setPatientAddress] = useState("");
  const [patient_dob, setPatientDob] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null); // New image preview
  const [existingImage, setExistingImage] = useState(null); // Existing profile image
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
    async function fetchPatientData(id) {
      if (!id) return;

      try {
        const response = await fetch(`http://localhost:8000/patient/getpatient/${id}`);
        if (!response.ok) {
          throw new Error("Patient not found!");
        }
        const patient = await response.json();
        setPatientPhone(patient.patient_phone);
        setPatientGender(patient.patient_gender);
        setPatientAddress(patient.patient_address);
        setPatientDob(patient.patient_dob.split("T")[0]); // Extracts YYYY-MM-DD

        // Store existing profile image URL
        if (patient.profile_picture) {
          const imageUrl = `http://localhost:8000/uploads/${patient.profile_picture}`;
          setExistingImage(imageUrl);
          setPreview(imageUrl); // Show existing image initially
        }
      } catch (err) {
        console.error("Error fetching patient data:", err);
      }
    }

    if (id) {
      fetchPatientData(id);
    }
  }, [id]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    // Generate a preview URL for the selected image
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append("patient_phone", patient_phone);
    formData.append("patient_gender", patient_gender);
    formData.append("patient_address", patient_address);
    formData.append("patient_dob", patient_dob);
    if (file) {
      formData.append("file", file);
    }

    try {
      const response = await fetch(
        `http://localhost:8000/patient/updatepatient/${id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        alert("Profile updated successfully!");
        navigate("/profile");
      } else {
        console.error("Failed to update profile:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2 className="profile-name">Edit Profile</h2>

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="profile-section">
            <h4 className="section-title">Profile Picture</h4>
            {preview && (
              <img src={preview} alt="Profile Preview" className="profile-image" />
            )}
            <div className="profile-info">
              <span className="label">Upload File :</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="input-field"
              />
            </div>
          </div>

          <div className="profile-section">
            <h4 className="section-title">Contact Information</h4>
            <div className="profile-info">
              <span className="label">Phone :</span>
              <input
                type="text"
                value={patient_phone}
                onChange={(e) => setPatientPhone(e.target.value)}
                className="input-field"
              />
            </div>
            <div className="profile-info">
              <span className="label">Address :</span>
              <input
                type="text"
                value={patient_address}
                onChange={(e) => setPatientAddress(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div className="profile-section">
            <h4 className="section-title">Personal Information</h4>
            <div className="profile-info">
              <span className="label">Gender :</span>
              <select
                value={patient_gender}
                onChange={(e) => setPatientGender(e.target.value)}
                className="input-field"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="profile-info">
              <span className="label">Date of Birth :</span>
              <input
                type="date"
                value={patient_dob}
                onChange={(e) => setPatientDob(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <button type="submit" className="save-btn">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditProfile;
