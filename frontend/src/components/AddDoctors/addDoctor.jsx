import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import Notifi from "../Notification/notifi"; // Import the Notification component
import "./addDoctor.css";

function AddDoctor() {
  const [image, setImage] = useState(null);
  const [file, setFile] = useState(null);
  const [doct_name, setdoct_name] = useState("");
  const [doct_email, setdoct_email] = useState("");
  const [doct_phone, setdoct_phone] = useState("");
  const [doct_specialization, setdoct_specialization] = useState("");
  const [doct_degree, setdoct_degree] = useState("");
  const [doct_experience, setdoct_experience] = useState("");
  const [doct_consultationFees, setdoct_consultationFees] = useState("");
  const [doct_address, setdoct_address] = useState("");
  const [doct_about, setdoct_about] = useState("");
  const [notification, setNotification] = useState(null); // State for notification

  const navigate = useNavigate(); // Initialize useNavigate

  // Handle Image Preview
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setFile(file);
    }
  };

  // Async function to add doctor
  const addDoctor = async (ev) => {
    ev.preventDefault();
    const formData = new FormData();
    formData.append("doct_name", doct_name);
    formData.append("doct_email", doct_email);
    formData.append("doct_phone", doct_phone);
    formData.append("doct_specialization", doct_specialization);
    formData.append("doct_experience", doct_experience);
    formData.append("doct_degree", doct_degree);
    formData.append("doct_consultationFees", doct_consultationFees);
    formData.append("doct_address", doct_address);
    formData.append("doct_about", doct_about);

    if (file) {
      formData.append("file", file);
    }

    const response = await fetch("http://localhost:8000/admin/adddoctor", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      setNotification({ message: "Doctor added successfully!", type: "success" }); // Show success notification
      setTimeout(() => setNotification(null), 1000); // Hide notification after 4 seconds
      setdoct_name("");
      setdoct_email("");
      setdoct_phone("");
      setdoct_specialization("");
      setdoct_degree("");
      setdoct_experience("");
      setdoct_consultationFees("");
      setdoct_address("");
      setdoct_about("");
      setFile(null);
      setImage(null); // Clear the image preview after successful submission
      navigate("/admin/listdoctors"); // Redirect after submission
    } else {
      setNotification({ message: "Failed to add Doctor. Please try again.", type: "error" }); // Show error notification
      setTimeout(() => setNotification(null), 4000); // Hide notification after 4 seconds
    }
  };

  return (
    <>
      <h1>Add Doctor</h1>
      <div className="add-doctor-container">
        {notification && <Notifi message={notification.message} type={notification.type} />} {/* Show notification */}
        <form className="doctor-form" onSubmit={addDoctor}>
          {/* Doctor Image */}
          <div className="form-group image-upload">
            <label>Upload Doctor's Image</label>
            <div className="image-preview-container">
              {image && <img src={image} alt="Doctor" className="preview-image" />}
              <input type="file" accept="image/*" onChange={handleImageChange} />
            </div>
          </div>

          <div className="left-right">
            <div className="form-left">
              {/* Doctor Name */}
              <div className="form-group">
                <label>Doctor Name</label>
                <input
                  type="text"
                  placeholder="Enter Doctor's Name"
                  onChange={(ev) => setdoct_name(ev.target.value)}
                  required
                />
              </div>

              {/* Email */}
              <div className="form-group">
                <label>Email ID</label>
                <input
                  type="text"
                  placeholder="Enter Email"
                  onChange={(ev) => setdoct_email(ev.target.value)}
                  required
                />
              </div>

              {/* Experience */}
              <div className="form-group">
                <label>Experience (Years)</label>
                <select onChange={(ev) => setdoct_experience(ev.target.value)} required>
                  <option value="">Select Experience</option>
                  <option value="1-3">1-3 Years</option>
                  <option value="4-7">4-7 Years</option>
                  <option value="8-12">8-12 Years</option>
                  <option value="12+">12+ Years</option>
                </select>
              </div>

              {/* Fees */}
              <div className="form-group">
                <label>Consultation Fees (₹)</label>
                <input
                  type="text"
                  placeholder="Enter Fees"
                  onChange={(ev) => setdoct_consultationFees(ev.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-right">
              {/* Specialist */}
              <div className="form-group">
                <label>Specialist In</label>
                <select onChange={(ev) => setdoct_specialization(ev.target.value)} required>
                  <option value="">Select Specialization</option>
                  <option value="General Physician">General Physician</option>
                  <option value="Gynecologist">Gynecologist</option>
                  <option value="Dermatologist">Dermatologist</option>
                  <option value="Pediatricians">Pediatricians</option>
                  <option value="Neurologist">Neurologist</option>
                  <option value="Gastroenterologist">Gastroenterologist</option>
                </select>
              </div>

              {/* Degree */}
              <div className="form-group">
                <label>Degree</label>
                <input
                  type="text"
                  placeholder="Enter Degree (e.g., MBBS, MD)"
                  onChange={(ev) => setdoct_degree(ev.target.value)}
                  required
                />
              </div>

              {/* Phone Number */}
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  placeholder="Enter mobile Number"
                  onChange={(ev) => setdoct_phone(ev.target.value)}
                  required
                />
              </div>

              {/* Address */}
              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  placeholder="Enter Address Line"
                  onChange={(ev) => setdoct_address(ev.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* About Doctor */}
          <div className="form-group">
            <label>About Doctor</label>
            <textarea
              rows="4"
              placeholder="Write about the doctor..."
              onChange={(ev) => setdoct_about(ev.target.value)}
              required
            ></textarea>
          </div>

          {/* Submit Button */}
          <button type="submit">Add Doctor</button>
        </form>
      </div>
    </>
  );
}

export default AddDoctor;
