import React, { useEffect, useState } from "react";
import "./notifi.css";

function Notifi({ message, onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose(); // Call onClose function after 5s
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!visible) return null;

  return (
    <div className="notification">
      <p>{message}</p>
      <div className="progress-bar"></div>
    </div>
  );
}

export default Notifi;
