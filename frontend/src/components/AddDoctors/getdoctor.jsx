import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './getdoctor.css';
import Loading from '../Loading/loading';

function GetDoctor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [image, setImage] = useState(null);
  const [doct_name, setDoctName] = useState("");
  const [doct_email, setDoctEmail] = useState("");
  const [doct_phone, setDoctPhone] = useState("");
  const [doct_specialization, setDoctSpecialization] = useState("");
  const [doct_degree, setDoctDegree] = useState("");
  const [doct_experience, setDoctExperience] = useState("");
  const [doct_consultationFees, setDoctConsultationFees] = useState("");
  const [doct_address, setDoctAddress] = useState("");
  const [doct_about, setDoctAbout] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDoctorData() {
      try {
        const response = await fetch(`http://localhost:8000/admin/getdoctor/${id}`);
        if (!response.ok) {
          throw new Error("Doctor not found!");
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
        setImage(doctor.file);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        navigate("/listdoctors");
      }
    }
    fetchDoctorData();
  }, [id, navigate]);

  const handleEdit = () => {
    navigate(`/admin/editdoctor/${id}`);
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this doctor?")) {
      try {
        const response = await fetch(`http://localhost:8000/admin/deletedoctor/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Failed to delete the doctor.");
        }
        alert("Doctor deleted successfully!");
        navigate("/admin/listdoctors");
      } catch (err) {
        alert(err.message);
      }
    }
  };

  if (loading) return <div className="loading"><Loading/></div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="get-doctor-details">
      <h2>Doctor Details</h2>
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
              <p><strong>Address:</strong> {doct_address}</p>
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

          {/* Buttons */}
          <div className="get-doctor-buttons">
            <button className="edit-button" onClick={handleEdit}>Edit</button>
            <button className="delete-button" onClick={handleDelete}>Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GetDoctor;
