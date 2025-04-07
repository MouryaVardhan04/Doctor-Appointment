import React, { useEffect, useState } from "react";
import "./notifi.css";

function Notifi({ message, onClose, type }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose(); // Call onClose function after 2 seconds
    }, 2000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!visible) return null;

  return (
    <div className={`notification ${type}`}>
      <h6>{message}</h6>
      <div className="progress-bar"></div>
    </div>
  );
}

export default Notifi;
