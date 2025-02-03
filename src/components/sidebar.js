import React from "react";
import { VscReport } from "react-icons/vsc";
import { FaClipboardList } from "react-icons/fa6";
import { IoMdAnalytics } from "react-icons/io";
import { TbMessageReportFilled } from "react-icons/tb";
import { NavLink } from "react-router-dom"; // Use NavLink for active class
import { jwtDecode } from 'jwt-decode';
import { FaHome, FaBox, FaQrcode, FaFileAlt, FaUserCheck, FaUser, FaSignOutAlt, FaChartLine } from "react-icons/fa";
import "../style/sidebar.css"; // Optional: for styling the sidebar
//import Image from 'next/image'
const Sidebar = () => {
  const getUserType = () => {
    const token = localStorage.getItem("token"); // Replace with your token storage method
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        return decodedToken.email; // Assuming 'usertype' is in the token
      } catch (err) {
        console.error("Invalid token:", err);
        return null;
      }
    }
    return null;
  };

  const userType = getUserType();
  const handleLogout = () => {
    console.log("Logging out...");
    localStorage.clear(); // Remove the token from localStorage
  };
  
  return (
    <div className="sidebar">
      <img src="log.png" alt="FIRI" className="logo" placeholder="blur"/>
      <nav className="nav-menu">
        {userType !== "admin@gmail.com" && (
          <>
            <NavLink to="/" activeClassName="active">
              <FaHome className="nav-icon" /> Home
            </NavLink>
            <NavLink to="/profile" activeClassName="active">
              <FaHome className="nav-icon" /> Profile
            </NavLink>
       
            <NavLink to="/userComplaints" activeClassName="active">
            <TbMessageReportFilled className="nav-icon" /> File Report
            </NavLink>
            <NavLink to="/bulletinboard" activeClassName="active">
            <FaClipboardList className="nav-icon" /> Bulletin
            </NavLink>
            <NavLink to="/retrievalRequests" activeClassName="active">
            <IoMdAnalytics   className="nav-icon" /> Retrieval Status
            </NavLink>
          </>
        )}
        {userType === "admin@gmail.com" && (
          <>
          <NavLink to="/" activeClassName="active">
              <FaHome className="nav-icon" /> Home
            </NavLink>
            <NavLink to="/dashboard" activeClassName="active">
              <FaChartLine className="nav-icon" /> Dashboard
            </NavLink>
          
            <NavLink to="/complaints" activeClassName="active">
              <FaBox className="nav-icon" /> Lost Complaint done
            </NavLink>
            <NavLink to="/additem" activeClassName="active">
              <FaQrcode className="nav-icon" /> Found Items done
            </NavLink>
            <NavLink to="/ItemScan" activeClassName="active">
              <FaFileAlt className="nav-icon" /> Scan Item
            </NavLink>
            <NavLink to="/manaRequests" activeClassName="active">
              <FaUserCheck className="nav-icon" /> Manage Request
            </NavLink>
         
            <NavLink to="/profile" activeClassName="active">
              <FaHome className="nav-icon" /> Profile
            </NavLink>
          </>
        )}
           <div className="logout">
            
              <NavLink to="/login" activeClassName="active">
              <button onClick={handleLogout}  >
                <FaSignOutAlt className="nav-icon" /> Log Out
                
                </button>
                </NavLink>
            </div>
      </nav>
    </div>
  );
};

export default Sidebar;
