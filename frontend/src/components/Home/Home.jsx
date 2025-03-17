import React, { useState, useEffect } from 'react';
import HomeList from '../HomeDoctors/HomeList';

function Home() {
  const [username, setUsername] = useState("");

  useEffect(() => {
    async function fetchUser() {
      const response = await fetch("http://localhost:8000/auth/user", {
        method: "GET",
        credentials: "include", // Important: Allows cookies to be sent
      });

      if (response.ok) {
        const data = await response.json();
        setUsername(data.user.username); // Adjust based on the response structure
      } else {
        console.error("Failed to fetch user:", response.statusText);
      }
    }

    fetchUser();
  }, []);

  return (
    <div>
      <HomeList/>
    </div>
  );
}

export default Home;
