import React, { useEffect, useState } from "react";
import "./Doctor.css";
import { fetchData } from "../../api/fetchData";
import Card from "../layout/Card";
import {NavLink} from "react-router-dom"
const Doctors = () => {
  const [data, setData] = useState([]);
  const [searchData, setSearchData] = useState([]);
  const [id, setId] = useState(-1);
  const myMap = new Map();
  myMap.set("General Physician", 0);
  myMap.set("Gynecologist", 1);
  myMap.set("Dermatologist", 2);
  myMap.set("Pediatrician", 3);
  myMap.set("Neurology", 4);
  myMap.set("Gaestrontologist", 5);
  const handleClick = (e) => {
    const text = e.target.innerText;
    const newId=myMap.get(text)
    const updatedId=id==newId?-1:newId
    setId(updatedId);
    if(updatedId==-1){
      setSearchData(data);
    }
    else{
      setSearchData(data.filter((currData)=>currData.doct_specialization.toLowerCase().includes(text.toLowerCase())))
    }
  };
  useEffect(() => {
    setData(fetchData);
    setSearchData(fetchData);
  }, []);

  return (
    <>
      <section className="doctor-container">
        <p>Browse through the doctors specialist</p>
        <div className="main">
          <div style={{width: "250px"}}>
            <button
              className={`main-1 ${id == 0 ? "isActive" : ""}`}
              onClick={handleClick}
            >
              General Physician
            </button>
            <button  className={`main-1 ${id == 1 ? "isActive" : ""}`}
              onClick={handleClick}>
              Gynecologist
            </button>
            <button  className={`main-1 ${id == 2 ? "isActive" : ""}`}
              onClick={handleClick}>
              Dermatologist
            </button>
            <button  className={`main-1 ${id == 3 ? "isActive" : ""}`}
              onClick={handleClick}>
              Pediatrician
            </button>
            <button  className={`main-1 ${id == 4 ? "isActive" : ""}`}
              onClick={handleClick}>
              Neurology
            </button>
            <button  className={`main-1 ${id == 5 ? "isActive" : ""}`}
              onClick={handleClick}>
              Gaestrontologist
            </button>
          </div>
          <div className="main-2">
            <ul className="cards-grid">
              {searchData.map((currData, index) => {
                return <NavLink to={`/appointments/${currData.doct_name}`} ><Card key={index} currData={currData} /></NavLink>
              })}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
};

export default Doctors;
