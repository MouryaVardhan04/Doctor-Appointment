import React from "react";
import image from "../../assets/logo.svg";
import './footer.css';

const Footer = () => {
  return (
    <>
      <footer className="footer">
        <div className="footer-grid">
          <div>
            <img src={image} alt="Logo" />
            <p className="txt">
              At <strong>HealthCare Plus</strong>, we are dedicated to delivering top-quality medical care that ensures patient satisfaction and well-being. Our team of expert healthcare professionals works tirelessly to provide personalized treatment plans tailored to each patient’s unique needs.
            </p>
          </div>
          <div>
            <h1>COMPANY</h1>
            <ul className="footer-text">
              <li>Home</li>
              <li>About Us</li>
              <li>Delivery</li>
              <li>Policy</li>
            </ul>
          </div>
          <div>
            <h1>GET IN TOUCH</h1>
            <p className="txt">+91 8519827056</p>
            <p className="txt">jaicodes2006@gmail.com</p>
            <br />
            <p className="txt">+91 9381340810</p>
            <p className="txt">mouryabhukya04@gmail.com</p>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} HealthCare Plus. All Rights Reserved.</p>
        </div>
      </footer>
    </>
  );
};

export default Footer;
