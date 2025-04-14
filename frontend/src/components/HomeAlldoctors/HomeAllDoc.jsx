import React, { useEffect, useState } from "react";
import './HomeAllDoc.css';
import { Link } from "react-router-dom";
import Loading from "../Loading/loading";

function HomeAllDoc() {
  const [doctors, setDoctors] = useState([]);
  const [selectedSpecialist, setSelectedSpecialist] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:8000/home/alldoctors");
        const result = await response.json();
        setDoctors(result.alldata || []);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFilterChange = (specialist) => {
    setSelectedSpecialist((prev) => (prev === specialist ? "" : specialist));
  };

  const filteredDoctors = selectedSpecialist
    ? doctors.filter((doctor) => doctor.doct_specialization === selectedSpecialist)
    : doctors;

  return (
    <div className="doctors-list-container">
      <div className="filter-section">
        <h3 className="filter-title">Specializations</h3>
        <div className="specialty-filter">
          {[
            { label: "General Physician", key: "General Physician" },
            { label: "Gynecologist", key: "Gynecologist" },
            { label: "Dermatologist", key: "Dermatologist" },
            { label: "Pediatricians", key: "Pediatricians" },
            { label: "Neurologist", key: "Neurologist" },
            { label: "Gastroenterologist", key: "Gastroenterologist" },
          ].map(({ label, key }) => (
            <div
              key={key}
              className={`filter-item ${selectedSpecialist === key ? "selected" : ""}`}
              onClick={() => handleFilterChange(key)}
            >
              {label}
            </div>
          ))}
        </div>
      </div>

      <div className="doctors-grid">
        {loading ? (
          <Loading />
        ) : filteredDoctors.length > 0 ? (
          filteredDoctors.map((doctor) => (
            <Link to={`/doctor/${doctor._id}`} key={doctor._id} className="doctor-card">
              <div className="doctor-image">
                <img
                  src={doctor.file ? `http://localhost:8000/uploads/${doctor.file}` : "/default-doctor.png"}
                  alt={doctor.doct_name}
                />
              </div>
              <h3 className="doctor-name">{doctor.doct_name}</h3>
              <p className="doctor-specialty">{doctor.doct_specialization}</p>
              <p className="doctor-specialty">₹{doctor.doct_consultationFees} Consultation Fee</p>
            </Link>
          ))
        ) : (
          <p className="no-doctors">No doctors found for this specialization.</p>
        )}
      </div>
    </div>
  );
}

export default HomeAllDoc;
