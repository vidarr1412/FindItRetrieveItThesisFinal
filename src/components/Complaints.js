import React, { useState, useEffect } from "react";
import { FaSearch, FaFilter } from "react-icons/fa";
import Sidebar from "./sidebar";
import "../style/manag.css";

function Manage() {
  const [filterText, setFilterText] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showViewMoreModal, setShowViewMoreModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);  // State to manage update modal visibility
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requests, setRequests] = useState([]); // No initial data here

  // Fetch all data from the database when the component mounts
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch("http://10.10.83.224:5000/complaints");
        const data = await response.json();
        setRequests(data);
      } catch (error) {
        console.error("Error fetching requests:", error);
      }
    };
    
    fetchRequests();
  }, []);

  const filteredRequests = requests.filter((item) =>
    item.complainer.toLowerCase().includes(filterText.toLowerCase())
  );

  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newComplaint = {
      complainer: formData.get("complainer"),
      itemname: formData.get("itemname"),
      type: formData.get("type"),
      contact: formData.get("contact"),
      date: formData.get("date"),
      location: formData.get("location"),
      time: formData.get("time"),
      description:formData.get("description"),
    };

    try {
      const response = await fetch("http://10.10.83.224:5000/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newComplaint),
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        setRequests([...requests, { ...newComplaint, status: "Not Found", finder: "N/A" }]);
        setShowModal(false);
      } else {
        alert("Error filing complaint. Please try again.");
      }
    } catch (error) {
      console.error("Error filing complaint:", error);
      alert("Error filing complaint. Please try again.");
    }
  };

  const handleViewMore = (request) => {
    setSelectedRequest(request);
    setShowViewMoreModal(true);
  };
  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this request?")) {
      // Optimistically remove the complaint from the state
      const updatedRequests = requests.filter((req) => req._id !== selectedRequest._id);
      setRequests(updatedRequests);
  
      try {
        const response = await fetch(
          `http://10.10.83.224:5000/complaints/${selectedRequest._id}`,
          { method: "DELETE" }
        );
  
        if (response.ok) {
          const result = await response.json();
          alert(result.message || "Complaint successfully deleted.");
          setShowViewMoreModal(false); // Close modal after successful deletion
        } else {
          // Roll back the change in case of failure
          setRequests([...updatedRequests, selectedRequest]);
          alert("Failed to delete the complaint. Please try again.");
        }
      } catch (error) {
        // Roll back the change in case of failure
        setRequests([...updatedRequests, selectedRequest]);
        console.error("Error deleting complaint:", error);
        alert("An error occurred while deleting the complaint. Please try again.");
      }
    }
  };
  
  

  const handleUpdate = () => {
    setShowUpdateModal(true);  // Show the update modal when the "Update" button is clicked
  };
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updatedRequest = {
      ...selectedRequest,
      complainer: formData.get("complainer"),
      itemname: formData.get("itemname"),
      type: formData.get("type"),
      description: formData.get("description"),
      contact: formData.get("contact"),
      date: formData.get("date"),
      location: formData.get("location"),
      time: formData.get("time"),
      status: formData.get("status"),
      finder: formData.get("finder"),
    };

    try {
      const response = await fetch(`http://10.10.83.224:5000/complaints/${selectedRequest._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedRequest),
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);

        // Update the requests state with the updated request
        setRequests(
          requests.map((req) =>
            req._id === selectedRequest._id ? updatedRequest : req
          )
        );

        // Close the update modal and view more modal
        setShowUpdateModal(false);
        setShowViewMoreModal(false);

        // Optionally, re-fetch the latest data
        fetchRequests(); // Refresh the data
      } else {
        alert("Error updating complaint. Please try again.");
      }
    } catch (error) {
      console.error("Error updating complaint:", error);
      alert("Error updating complaint. Please try again.");
    }
  };
  const fetchRequests = async () => {
    try {
      const response = await fetch("http://10.10.83.224:5000/complaints");
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };


  return (
    <div className="home-container">
      <Sidebar />

      <header className="header">
        <h2>FIRI LOGO</h2>
      </header>

      <div className="content">
        <div className="manage-bulletin">
          <div className="breadcrumb">
            Manage Lost And Found {'>'} Manage Reports and Complaints
          </div>

          <div className="top-right-buttons">
            <button className="add-item-btn" onClick={() => setShowModal(true)}>
              + File Complaints
            </button>
            <button className="register-qr-btn">Register QR Code</button>
          </div>

          <div className="search-bar">
            <input
              type="text"
              placeholder="Search"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
            <FaSearch className="search-icon" />
            <FaFilter className="filter-icon" />
          </div>

          {filteredRequests.length > 0 ? (
            <table className="ffound-items-table">
              <thead>
                <tr>
                  <th>Complainer</th>
                  <th>Item Name</th>
                  <th>Item Type</th>
                  <th>Contact of the Complainer</th>
                  <th>Date</th>
                  <th>Location</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Finder</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((item, index) => (
                  <tr key={index}>
                    <td>{item.complainer}</td>
                    <td>{item.itemname}</td>
                    <td>{item.type}</td>
                    <td>{item.contact}</td>
                    <td>{item.date}</td>
                    <td>{item.location}</td>
                    <td>{item.time}</td>
                    <td>{item.status}</td>
                    <td>{item.finder}</td>
                    <td>
                      <button className="view-btn" onClick={() => handleViewMore(item)}>
                        View More
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-data">No matching requests found</div>
          )}
        </div>

        <div className="ppagination">
          <button className="page-nav">&lt; Previous</button>
          <button className="page-nav">Next &gt;</button>
        </div>
      </div>

      {/* Modal for filing complaints */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modaladminbulletin">
            <h2>File a Complaint</h2>
            <form onSubmit={handleComplaintSubmit}>
              <input type="text" name="complainer" placeholder="Your Name" required />
              <input type="text" name="itemname" placeholder="Item Name" required />
              <input type="text" name="type" placeholder="Item Type" required />
              <textarea type="text" name="description" placeholder="Description" required />
              <input type="text" name="contact" placeholder="Your Contact" required />
              <input type="date" name="date" required />
              <input type="text" name="location" placeholder="Location" required />
              <input type="time" name="time" required />
              <button type="submit" className="submit-btn">Submit</button>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {/* View More Modal */}
      {showViewMoreModal && selectedRequest && (
        <div className="modal-overlay">
          <div className="modaladminbulletin">
            <h2>Details</h2>
            <p><strong>Complainer:</strong> {selectedRequest.complainer}</p>
            <p><strong>Item Name:</strong> {selectedRequest.itemname}</p>
            <p><strong>Type:</strong> {selectedRequest.type}</p>
            <p><strong>Description: </strong>{selectedRequest.description}</p>
            <p><strong>Contact:</strong> {selectedRequest.contact}</p>
            <p><strong>Date:</strong> {selectedRequest.date}</p>
            <p><strong>Location:</strong> {selectedRequest.location}</p>
            <p><strong>Time:</strong> {selectedRequest.time}</p>
          
            <p><strong>Status:</strong> {selectedRequest.status}</p>
            <p><strong>Finder:</strong> {selectedRequest.finder}</p>
            <button className="update-btn" onClick={handleUpdate}>Update</button>
            <button className="delete-btn" onClick={handleDelete}>Delete</button>
            <button className="cancel-btn" onClick={() => setShowViewMoreModal(false)}>Close</button>
          </div>
        </div>
      )}

      {/* Update Modal */}
      {showUpdateModal && selectedRequest && (
        <div className="modal-overlay">
          <div className="modaladminbulletin">
            <h2>Update Complaint</h2>
            <form onSubmit={handleUpdateSubmit}>
              <input
                type="text"
                name="complainer"
                placeholder="Complainer"
                defaultValue={selectedRequest.complainer}
                required
              />
              <input
                type="text"
                name="itemname"
                placeholder="Item Name"
                defaultValue={selectedRequest.itemname}
                required
              />
              <input
                type="text"
                name="type"
                placeholder="Item Type"
                defaultValue={selectedRequest.type}
                required
              />
              <textarea
              type="text"
                name="description"
                placeholder="Description"
                defaultValue={selectedRequest.description}
                required
              />
              <input
                type="text"
                name="contact"
                placeholder="Contact"
                defaultValue={selectedRequest.contact}
                required
              />
              <input
                type="date"
                name="date"
                defaultValue={selectedRequest.date}
                required
              />
              <input
                type="text"
                name="location"
                placeholder="Location"
                defaultValue={selectedRequest.location}
                required
              />
                  <input
                type="time"
                name="time"
                defaultValue={selectedRequest.time}
                required
              />
              <select
  name="status"
  defaultValue={selectedRequest.status}
  required
>
  <option value="found">Found</option>
  <option value="not-found">Not Found</option>
</select>

                 <input
                type="text"
                name="finder"
                defaultValue={selectedRequest.finder}
                required
              />
             
              <button type="submit" className="submit-btn">Update</button>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setShowUpdateModal(false)}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Manage;
