import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // Import Link for navigation
import "./listdoctors.css";

function ListDoctors() {
  const [doctors, setDoctors] = useState([]); // Initialize as an empty array

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:8000/admin/alldoctors");
        const result = await response.json();
        console.log(result); // Debugging: Check API response
        setDoctors(result.alldata); // ✅ Fix: Access correct key
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchData();
  }, []);

  const [selectedSpecialist, setSelectedSpecialist] = useState("");

  const specialists = [...new Set(doctors.map((doctor) => doctor.doct_specialization))];

  const handleFilterChange = (specialist) => {
    setSelectedSpecialist((prev) => (prev === specialist ? "" : specialist));
  };

  const filteredDoctors = selectedSpecialist
    ? doctors.filter((doctor) => doctor.doct_specialization === selectedSpecialist)
    : doctors;

  return (
    <div className="admin-list-doctors">
      <h1>List of Doctors</h1>

      <div className="filter-container">
        <div className="radio-group">
          {specialists.map((specialist, index) => (
            <button
              key={index}
              className={`filter-btn ${selectedSpecialist === specialist ? "selected" : ""}`}
              onClick={() => handleFilterChange(specialist)}
            >
              {specialist} ({doctors.filter((doc) => doc.doct_specialization === specialist).length})
            </button>
          ))}
        </div>
      </div>

      <div className="Box1">
        {filteredDoctors.map((doctor) => (
          <Link to={`/admin/getdoctor/${doctor._id}`} key={doctor._id} className="doctor-container">
            <div className="imgContainer">
              <img
                src={`http://localhost:8000/uploads/${doctor.file}`} // Fix image path
                alt={doctor.doct_name}
              />
            </div>
            <h2>{doctor.doct_name}</h2>
            <p>{doctor.doct_specialization}</p> {/* Fix specialization reference */}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default ListDoctors;
