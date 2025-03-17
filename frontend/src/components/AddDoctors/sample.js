import React from "react";
import { FaLongArrowAltRight } from "react-icons/fa";
import image from "../pages/doctors.png";
import img1 from "../pages/img1.svg";
import img2 from "../pages/img2.svg";
import img3 from "../pages/img3.svg";
import img4 from "../pages/img4.svg";
import img5 from "../pages/img5.svg";
import img6 from "../pages/img6.svg";
import "./Home.css";
import { useQuery } from "@tanstack/react-query";
import { fetchData } from "../../api/fetchData";
import Card from "../layout/Card";
import {NavLink} from "react-router-dom"
const Home = () => {
  const { data } = useQuery({
    queryKey: ["doctors"],
    queryFn: fetchData,
  });
  const limitedData = data?.slice(0, 10) || [];
  console.log(limitedData)
  return (
    <>
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
          <img src={image} alt="doctors" />
        </div>

        <div className="box2">
          <h2>Find by Speciality</h2>
          <p>
            Simply browse through our extensive list of trusted doctors,
            schedule your appointment hassle-free.
          </p>
          <div className="images">
            <div>
              <img src={img1} alt="" />
              <p>General physician</p>
            </div>
            <div>
              <img src={img2} alt="" />
              <p>General physician</p>
            </div>
            <div>
              <img src={img3} alt="" />
              <p>General physician</p>
            </div>
            <div>
              <img src={img4} alt="" />
              <p>General physician</p>
            </div>
            <div>
              <img src={img5} alt="" />
              <p>General physician</p>
            </div>
            <div>
              <img src={img6} alt="" />
              <p>General physician</p>
            </div>
          </div>
        </div>

        <div className="box3">
          <h2>Top Doctors to Book</h2>
          <p>Simply browse through our extensive list of trusted doctors.</p>
          <ul className="cards-grid">
          {limitedData.map((currData,index) => {
               return <Card key={index} currData={currData}/>;
            })}
            </ul>
            <NavLink to={`/doctors`}><button className="more-btn">more</button></NavLink>
          
        </div>

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
          <img src={image} alt="doctors" />
        </div>
      </section>
    </>
  );
};

export default Home;
