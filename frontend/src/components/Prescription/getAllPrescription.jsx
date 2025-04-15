import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FaFileMedical, FaCalendarAlt, FaUserMd } from 'react-icons/fa';
import "./getAllPrescription.css";

function GetAllPrescription() {
  const [ id,setId] = useState();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

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
          setId(data.user.id);
        } else {
          console.error("Failed to fetch user:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setMessage("❌ Failed to load user session.");
      }
    }

    fetchUser();
  }, []);

  useEffect(() => {

    const fetchPrescriptions = async () => {
      if (!id) {
          setError("Patient User ID is required to fetch prescriptions.");
          setLoading(false);
          return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:8000/home/getDoctPres/${id}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch prescriptions');
        }
        const data = await response.json();
        setPrescriptions(data.doctorPrescriptions || []);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching prescriptions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return <div className="loading-all-pres">Loading Prescriptions...</div>;
  }

  if (error) {
    return <div className="error-all-pres">Error: {error}</div>;
  }

  return (
    <div className="get-all-prescriptions-container">
      <h2><FaFileMedical /> Your Prescriptions</h2>
      {prescriptions.length === 0 ? (
        <p className="no-prescriptions-message">You currently have no prescriptions recorded.</p>
      ) : (
        <div className="prescriptions-list">
          {prescriptions.map((pres) => (
            <div key={pres._id} className="prescription-card">
              <div className="card-header">
                 <h4>Prescription from Dr. {pres.doctor_name}</h4>
                 <span className="card-date">
                     <FaCalendarAlt /> {formatDate(pres.createdAt)} 
                 </span>
              </div>
              <div className="card-body">
                <p><strong>Diagnosis:</strong> {pres.diagnosis || 'N/A'}</p>
                <p><strong>Medications:</strong> {pres.medications?.length || 0} item(s)</p>
                 <p><strong>Follow-up:</strong> {formatDate(pres.followUp) || 'N/A'}</p>
              </div>
              <div className="card-footer">
                <Link to={`/getDoctPres/${pres.appointmentId}`} className="view-details-link">
                  View Full Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default GetAllPrescription;
