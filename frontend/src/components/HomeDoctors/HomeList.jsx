import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaLongArrowAltRight } from "react-icons/fa";
import img1 from '../../assets/filterimg1.svg';
import img2 from '../../assets/filterimg2.svg';
import img3 from '../../assets/filterimg3.svg';
import img4 from '../../assets/filterimg4.svg';
import img5 from '../../assets/filterimg5.svg';
import img6 from '../../assets/filterimg6.svg';
import image from'../../assets/doctors.png';

import './HomeList.css';

function HomeList() {
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

  // Extract specializations and count occurrences
  const specialistCounts = doctors.reduce((acc, doctor) => {
    acc[doctor.doct_specialization] = (acc[doctor.doct_specialization] || 0) + 1;
    return acc;
  }, {});

  const specialists = Object.keys(specialistCounts);

  const handleFilterChange = (specialist) => {
    setSelectedSpecialist((prev) => (prev === specialist ? "" : specialist));
  };

  const filteredDoctors = selectedSpecialist
    ? doctors.filter((doctor) => doctor.doct_specialization === selectedSpecialist)
    : doctors;

  return (
<section className="container">
  <div className="box1">
    <div className="box1-txt">
      <h1>Book Appointment With Trusted Doctors</h1>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginTop: "10px",
        }}
      >
        <img
          src="https://prescripto.vercel.app/assets/group_profiles-BCL6AVF5.png"
          alt="people"
          height={"40px"}
          width={"85px"}
        />
        <span>
          Simply browse through our extensive list of doctors and book
          appointment hassle-free
        </span>
      </div>
      <div>
        <button className="box1-btn">
          Book Appointment <FaLongArrowAltRight />
        </button>
      </div>
    </div>
    {/* This img tag needs an actual variable */}
    <img src={image} alt="doctors" />
  </div>  {/* ✅ Closing box1 properly here */}

  {/* Find by Speciality */}
  <div className="box2">
    <h2>Find by Speciality</h2>
    <p>Simply browse through our extensive list of trusted doctors, schedule your appointment hassle-free.</p>

    <div className="images">
      {[
        { img: img1, label: "General Physician", key: "General Physician" },
        { img: img6, label: "Gynecologist", key: "Gynecologist" },
        { img: img2, label: "Dermatologist", key: "Dermatologist" },
        { img: img3, label: "Pediatricians", key: "Pediatricians" },
        { img: img4, label: "Neurologist", key: "Neurologist" },
        { img: img5, label: "Gastroenterologist", key: "Gastroenterologist" },
      ].map(({ img, label, key }) => (
        <div key={key} 
          className={`speciality-item ${selectedSpecialist === key ? "selected" : ""}`} 
          onClick={() => handleFilterChange(key)}
        >
          <img src={img} alt={label} />
          <p>{label}</p>
        </div>
      ))}
    </div>
  </div>

  {/* Doctors List */}
  <div className="Box1">
    <h1>Book Appointment With Trusted Doctors</h1>
    <span>Simply browse through our extensive list of doctors and book appointments hassle-free.</span>
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

</section> 


  );
}

export default HomeList;
