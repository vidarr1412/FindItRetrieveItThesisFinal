import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter } from 'react-icons/fa';
import Sidebar from "./sidebar";
import '../style/additem.css';
import axios from 'axios';
import ReactQrScanner from 'react-qr-scanner'; // Import the QR scanner

function ItemScanner() {
  const [qrData, setQrData] = useState(""); // State to hold the QR code data
  const [userDetails, setUserDetails] = useState({ email: '', firstName: '', lastName: '' }); // State to hold user details

  const fetchUserData = async (userId) => {
    try {
      const response = await axios.get(`http://10.10.83.224:5000/profile/${userId}`);
      const data = response.data;
      setUserDetails({
        email: data.email || '',
        firstName: data.firstName || '',
        lastName: data.lastName || ''
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleScan = (data) => {
    if (data) {
      setQrData(data.text); // Get QR code data (user ID in this case)
      fetchUserData(data.text); // Fetch user details using the user ID from QR code
    }
  };

  const handleError = (err) => {
    console.error("Error scanning QR code: ", err);
  };

  return (
    <div className="home-container">
      <Sidebar />
      <header className="header">
        <h2>FIRI LOGO</h2>
      </header>
      <div className="content">
        <div className="manage-bulletin">
          <div className="breadcrumb">Manage Lost and Found {'>'} Manage Found Items</div>
          <div className="top-right-buttons">
            <button className="add-item-btn" >+ Add Found Item</button>
            <button className="register-qr-btn">Register QR Code</button>
          </div>
          <div className="camera-section">
            {/* Use ReactQrScanner to handle QR code scanning */}
            <ReactQrScanner
              delay={300} // Set delay to 300ms to give time for the camera to load
              style={{ width: "100%" }} // Adjust the scanner view size
              onScan={handleScan} // Handle scan result
              onError={handleError} // Handle scan error
            />
          </div>
          <div>
            <p>Scanned QR Code Value: {qrData}</p>
            {userDetails.email && (
              <div>
                <p><strong>Email:</strong> {userDetails.email}</p>
                <p><strong>First Name:</strong> {userDetails.firstName}</p>
                <p><strong>Last Name:</strong> {userDetails.lastName}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ItemScanner;
