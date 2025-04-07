import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Notifi from "../Notification/notifi"; // ✅ Import Notification
import './editdoctor.css';

function EditDoctor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [image, setImage] = useState(null);
  const [file, setFile] = useState(null);
  const [doct_name, setDoctName] = useState("");
  const [doct_email, setDoctEmail] = useState("");
  const [doct_phone, setDoctPhone] = useState("");
  const [doct_specialization, setDoctSpecialization] = useState("");
  const [doct_degree, setDoctDegree] = useState("");
  const [doct_experience, setDoctExperience] = useState("");
  const [doct_consultationFees, setDoctConsultationFees] = useState("");
  const [doct_address, setDoctAddress] = useState("");
  const [doct_about, setDoctAbout] = useState("");
  const [message, setMessage] = useState(null); // ✅ For notifications
  const [type, setType] = useState("success"); // ✅ success / error

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setFile(file);
    }
  };

  useEffect(() => {
    async function fetchDoctorData() {
      try {
        const response = await fetch(`http://localhost:8000/admin/getdoctor/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch doctor data");
        }
        const doctor = await response.json();

        setDoctName(doctor.doct_name);
        setDoctEmail(doctor.doct_email);
        setDoctPhone(doctor.doct_phone);
        setDoctSpecialization(doctor.doct_specialization);
        setDoctDegree(doctor.doct_degree);
        setDoctExperience(doctor.doct_experience);
        setDoctConsultationFees(doctor.doct_consultationFees);
        setDoctAddress(doctor.doct_address);
        setDoctAbout(doctor.doct_about);
        setImage(`http://localhost:8000/uploads/${doctor.file}`);
      } catch (error) {
        setMessage("❌ Error fetching doctor data");
        setType("error");
        setTimeout(() => navigate("/admin/listdoctors"), 3000);
      }
    }
    fetchDoctorData();
  }, [id, navigate]);

  const updateDoctor = async (ev) => {
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
    if (file) formData.append("file", file);

    try {
      const response = await fetch(`http://localhost:8000/admin/editdoctor/${id}`, {
        method: "PUT",
        body: formData,
      });

      if (response.ok) {
        setMessage("✅ Doctor updated successfully");
        setType("success");
        setTimeout(() => navigate("/admin/listdoctors"), 2000);
      } else {
        const data = await response.json();
        setMessage(`❌ Failed: ${data.message || "Unknown error"}`);
        setType("error");
      }
    } catch (error) {
      setMessage("❌ Error updating doctor");
      setType("error");
    }
  };

  return (
    <>
      {message && <Notifi message={message} onClose={() => setMessage(null)} type={type} />} {/* ✅ Notification */}

      <h1>Edit Doctor</h1>
      <div className="edit-doctor-container">
        <form className="doctor-form" onSubmit={updateDoctor}>
          {/* ...everything else stays the same */}
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
              <div className="form-group">
                <label>Doctor Name</label>
                <input
                  type="text"
                  placeholder="Enter Doctor's Name"
                  value={doct_name}
                  onChange={(ev) => setDoctName(ev.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email ID</label>
                <input
                  type="email"
                  placeholder="Enter Email"
                  value={doct_email}
                  onChange={(ev) => setDoctEmail(ev.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Experience (Years)</label>
                <select
                  value={doct_experience}
                  onChange={(ev) => setDoctExperience(ev.target.value)}
                  required
                >
                  <option value="">Select Experience</option>
                  <option value="1-3">1-3 Years</option>
                  <option value="4-7">4-7 Years</option>
                  <option value="8-12">8-12 Years</option>
                  <option value="12+">12+ Years</option>
                </select>
              </div>

              <div className="form-group">
                <label>Consultation Fees (₹)</label>
                <input
                  type="number"
                  placeholder="Enter Fees"
                  value={doct_consultationFees}
                  onChange={(ev) => setDoctConsultationFees(ev.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-right">
              <div className="form-group">
                <label>Specialist In</label>
                <select
                  value={doct_specialization}
                  onChange={(ev) => setDoctSpecialization(ev.target.value)}
                  required
                >
                  <option value="">Select Specialization</option>
                  <option value="cardiology">Cardiology</option>
                  <option value="neurology">Neurology</option>
                  <option value="orthopedics">Orthopedics</option>
                  <option value="dermatology">Dermatology</option>
                  <option value="pediatrics">Pediatrics</option>
                  <option value="gynecology">Gynecology</option>
                </select>
              </div>

              <div className="form-group">
                <label>Degree</label>
                <input
                  type="text"
                  placeholder="Enter Degree (e.g., MBBS, MD)"
                  value={doct_degree}
                  onChange={(ev) => setDoctDegree(ev.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  placeholder="Enter Mobile Number"
                  value={doct_phone}
                  onChange={(ev) => setDoctPhone(ev.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  placeholder="Enter Address Line"
                  value={doct_address}
                  onChange={(ev) => setDoctAddress(ev.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>About Doctor</label>
            <textarea
              rows="4"
              placeholder="Write about the doctor..."
              value={doct_about}
              onChange={(ev) => setDoctAbout(ev.target.value)}
              required
            ></textarea>
          </div>

          <button type="submit">Update Doctor</button>
        </form>
      </div>
    </>
  );
}

export default EditDoctor;
