import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import Sidebar from './sidebar';
import '../style/reportmanage.css';

function UserRetrievalRequests() {
  const [requests, setRequests] = useState([]);
  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editDescription, setEditDescription] = useState('');
  const [editContactNumber, setEditContactNumber] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem('token');
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.id;

        const response = await fetch(`http://10.10.83.224:5000/retrieval-requests/${userId}`);
        const data = await response.json();
        setRequests(data);
        setTotalPages(Math.ceil(data.length / 10));
      } catch (error) {
        console.error("Error fetching requests:", error);
      }
    };

    fetchRequests();
  }, []);

  // Filter the requests based on the filterText
  const filteredRequests = requests.filter((request) =>
    request.name.toLowerCase().includes(filterText.toLowerCase())
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Open edit modal with selected request data
  const openEditModal = (request) => {
    setSelectedRequest(request);
    setEditDescription(request.description);
    setEditContactNumber(request.contactNumber);
    setShowEditModal(true);
  };

  // Update request
  const handleUpdate = async () => {
    if (!selectedRequest) return;

    try {
      const response = await fetch(`http://10.10.83.224:5000/retrieval-requests/${selectedRequest._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: editDescription, contactNumber: editContactNumber })
      });

      if (response.ok) {
        setRequests(requests.map(req => req._id === selectedRequest._id 
          ? { ...req, description: editDescription, contactNumber: editContactNumber } 
          : req
        ));
        setShowEditModal(false);
      }
    } catch (error) {
      console.error('Error updating request:', error);
    }
  };

  // Open delete confirmation modal
  const openDeleteModal = (request) => {
    setSelectedRequest(request);
    setShowDeleteModal(true);
  };

  // Delete request
  const handleDelete = async () => {
    if (!selectedRequest) return;

    try {
      const response = await fetch(`http://10.10.83.224:5000/retrieval-requests/${selectedRequest._id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setRequests(requests.filter(req => req._id !== selectedRequest._id));
        setShowDeleteModal(false);
      }
    } catch (error) {
      console.error('Error deleting request:', error);
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
          <div className="breadcrumb">Manage Retrieval Requests</div>
          <input
            type="text"
            placeholder="Filter by item name"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
          <table className="found-items-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Date Requested</th>
                <th>Description</th>
                <th>Contact Number</th>
                <th>Status</th>
                <th>Item Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length > 0 ? (
                filteredRequests.map((request) => (
                  <tr key={request._id}>
                    <td>{request.name}</td>
                    <td>{request.createdAt}</td>
                    <td>{request.description}</td>
                    <td>{request.contactNumber}</td>
                    <td>{request.status}</td>
                    <td>{request.itemId?.DESCRIPTION || 'N/A'}</td>
                    <td>
                      <button onClick={() => openEditModal(request)}>Edit</button>
                      <button onClick={() => openDeleteModal(request)}>Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-data">No retrieval requests found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Edit Request</h3>
            <label>Description:</label>
            <input type="text" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
            <label>Contact Number:</label>
            <input type="text" value={editContactNumber} onChange={(e) => setEditContactNumber(e.target.value)} />
            <button onClick={handleUpdate}>Save</button>
            <button onClick={() => setShowEditModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Are you sure you want to delete this request?</h3>
            <button onClick={handleDelete}>Yes, Delete</button>
            <button onClick={() => setShowDeleteModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserRetrievalRequests;
