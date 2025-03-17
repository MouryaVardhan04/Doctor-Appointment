import React from "react";
import "./Contact.css";
const Contact = () => {
  return (
    <>
      <section className="container">
        <h1>Contact Us</h1>
        <div className="b1">
          <img
            src="https://globmed.co.uk/wp-content/uploads/2023/05/paediatrician-doctor-with-child-scaled.jpg"
            alt=""
            width={"500px"}
          />
          <div>
            <h3>OUR OFFICE</h3>
            <div>
              <h4>Atal Bihari Vajpayee Indian Institue of Information Technology and Management</h4>
              <h5>Morena Link Road, Gwalior, Madhya Pardesh, India</h5>
            </div>
            <div style={{ marginTop: "20px" }}>
              <p>Tel1: +91 8519827056</p>
              <p>Email: jaicodes2006@gmail.com</p>
              <br />
              <p>Tel2: +91 9381340810</p>
              <p>Email: mouryabhukya04@gmail.com</p>
            </div>
            <h3>CAREERS AT DOCUBOOK</h3>
            <button className="job-btn">Explore Jobs</button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
