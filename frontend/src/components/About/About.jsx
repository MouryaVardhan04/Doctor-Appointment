import React from "react";
import "./About.css";

const About = () => {
  return (
    <>
      <section className="container">
        <h1>About Us</h1>
        <div className="b2">
          <img
            src="https://static.vecteezy.com/system/resources/thumbnails/026/375/249/small_2x/ai-generative-portrait-of-confident-male-doctor-in-white-coat-and-stethoscope-standing-with-arms-crossed-and-looking-at-camera-photo.jpg"
            alt="Doctor"
          />
          <p>
            At <strong>HealthCare Plus</strong>, we are committed to providing
            exceptional medical services that prioritize patient well-being and
            convenience. With a team of highly experienced and compassionate
            doctors, we offer comprehensive healthcare solutions tailored to
            your needs.
            <br />
            <br />
            Our platform bridges the gap between patients and medical
            professionals, ensuring that healthcare is easily accessible from
            anywhere. Whether you need a routine check-up, a specialist
            consultation, or urgent medical advice, we make sure you receive the
            best care without unnecessary delays. We offer a range of services,
            including preventive care, diagnostic screenings, chronic disease
            management, and mental health support, all designed to cater to your
            specific health needs.
            <br />
            <br />
            <strong>Our Vision</strong>
            <br />
            Our goal is to make quality healthcare accessible to everyone. We
            believe in using advanced medical technologies, expert diagnosis,
            and a patient-centered approach to ensure timely and effective
            treatments. By integrating innovation with compassionate care, we
            strive to create a healthier tomorrow for our patients.
            <br />
            <br />
            At HealthCare Plus, we emphasize transparency, affordability, and
            personalized care. We understand that each patient is unique, and we
            take the time to provide tailored treatment plans that align with
            their lifestyle and medical history. With our commitment to
            excellence, we continue to evolve and set new benchmarks in modern
            healthcare.
          </p>
        </div>

        <div>
          <h2>WHY CHOOSE US</h2>
          <div className="boxes">
            <div className="inside-b1">
              <h2>Expertise</h2>
              <p>
                Our team consists of highly qualified specialists with years of
                experience in their respective fields.
              </p>
            </div>
            <div className="inside-b2">
              <h2>Accessibility</h2>
              <p>
                We offer easy online appointment booking and telemedicine
                services to ensure convenient healthcare access.
              </p>
            </div>
            <div className="inside-b3">
              <h2>Compassionate Care</h2>
              <p>
                We prioritize patient comfort, offering personalized treatments
                in a friendly and caring environment.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default About;
