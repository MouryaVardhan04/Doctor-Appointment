import React, { useEffect, useState } from "react";
import './HomeAllDoc.css';
import { Link } from "react-router-dom";


function HomeAllDoc() {
    const [doctors, setDoctors] = useState([]);
    const [selectedSpecialist, setSelectedSpecialist] = useState("");
  
    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await fetch("http://localhost:8000/home/alldoctors");
          const result = await response.json();
          console.log(result);
          setDoctors(result.alldata || []);
        } catch (error) {
          console.error("Error fetching doctors:", error);
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
    <div>
            <p>Browse through the doctors specialist.</p>
      <div className="alldoctor-containar">
      <div className="left-filter">


    <div className="images">
      {[
        {  label: "General Physician", key: "General Physician" },
        {  label: "Gynecologist", key: "Gynecologist" },
        {  label: "Dermatologist", key: "Dermatologist" },
        {  label: "Pediatricians", key: "Pediatricians" },
        {  label: "Neurologist", key: "Neurologist" },
        {  label: "Gastroenterologist", key: "Gastroenterologist" },
      ].map(({ label, key }) => (
        <div key={key} 
          className={`speciality-items ${selectedSpecialist === key ? "selected" : ""}`} 
          onClick={() => handleFilterChange(key)}
        >
            <div className="label">
            <p>{label}</p>
            </div>
        </div>
      ))}
    </div>
  </div>
  <div className="Box1">
  {filteredDoctors.length > 0 ? (
      filteredDoctors.map((doctor) => (
        <Link to={`/admin/getdoctor/${doctor._id}`} key={doctor._id} className="doctor-container">
          <div className="imgContainer">
            <img
              src={doctor.file ? `http://localhost:8000/uploads/${doctor.file}` : "/default-doctor.png"}
              alt={doctor.doct_name}
            />
          </div>
          <h2>{doctor.doct_name}</h2>
          <p>{doctor.doct_specialization}</p>
        </Link>
      ))
    ) : (
      <p className="no-doctors">No doctors found for this specialization.</p>
    )}
  </div>

      </div>
    </div>
  )
}

export default HomeAllDoc;
