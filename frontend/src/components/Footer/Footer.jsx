import React from "react";
import image from "../../assets/logo.svg";
import './footer.css'
const Footer = () => {
  return (
    <>
      <footer className="footer">
        <div className="footer-grid">
          <div>
            <img src={image} alt="Logo" />
            <p className="txt">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Incidunt sit ipsam veniam quaerat et, temporibus sequi hic at perspiciatis facilis molestias dicta aliquam provident obcaecati eligendi, sapiente nostrum mollitia nobis laudantium minus tempore, nulla magnam repudiandae. Perferendis accusantium eos ipsam modi exercitationem consectetur quaerat sit.</p>
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
          <div >
            <h1>GET IN TOUCH</h1>
            <p className="txt">+91 8519827056</p>
            <p className="txt">jaicodes2006@gmail.com</p>
            <p className="txt">+91 9381340810</p>
            <p className="txt">mouryabhukya04@gmail.com</p>
            <p></p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
