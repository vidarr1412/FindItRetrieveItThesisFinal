import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter } from 'react-icons/fa';
import axios from 'axios';
import Sidebar from './sidebar';
import '../style/manaReq.css';

function ManageRequest() {
  const [filterText, setFilterText] = useState('');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await axios.get('http://10.10.83.224:5000/retrieval-requests');
      setRequests(response.data.requests);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching retrieval requests:', error);
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (type, id, updatedStatus) => {
    let endpoint = '';
  
    if (type === 'request') {
      endpoint = `http://10.10.83.224:5000/retrieval-request/${id}/status`;
    } else if (type === 'item') {
      if (!id) {
        console.error("Error: Item ID is undefined.");
        return;
      }
      endpoint = `http://10.10.83.224:5000/found-item/${id}/status`;
    }
  
    try {
      const response = await axios.put(endpoint, { status: updatedStatus });
      console.log(`Updated ${type}:`, response.data);
      fetchRequests(); // Refresh UI after update
    } catch (error) {
      console.error(`Error updating ${type} status:`, error);
    }
  };
  
  
  const handleStatusUpdate2 = async (type, id, updatedStatus) => {
    let endpoint = '';
  if (type === 'item') {
      endpoint = `http://10.10.83.224:5000/found-item/${id}/status`;
    }
  
    try {
      await axios.put(endpoint, { status: updatedStatus });
      fetchRequests(); // Refresh data after update
    } catch (error) {
      console.error(`Error updating ${type} status:`, error);
    }
  };

  const filteredRequests = requests.filter((request) =>
    request.name.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="home-container">
      <Sidebar />
      <header className="header">
        <h2>FIRI LOGO</h2>
      </header>
      <div className="content">
        <div className="manage-bulletin">
          <div className="breadcrumb">Manage Lost and Found {'>'} Manage Request</div>
          <div className="manareqsearch-bar">
            <input
              type="text"
              placeholder="Search"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
            <FaSearch className="ssearch-icon" />
            <FaFilter className="ffilter-icon" />
          </div>
          {loading ? (
            <div className="loading">Loading...</div>
          ) : filteredRequests.length > 0 ? (
            <table className="found-items-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Contact Number</th>
                  <th>ID</th>
                  <th>Status</th>
                  <th>Date Requested</th>
                  <th>Item Status</th>
                  <th>Action</th>
                  
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request, index) => (
                  <tr key={index}>
                    <td>{request.name}</td>
                    <td>{request.description}</td>
                    <td>{request.contactNumber}</td>
                    <td>{request.id}</td>
                    <td>{request.status}</td>
                    <td>{request.createdAt}</td>
                    <td>{request.itemId?.STATUS}</td>
                    <td>
                      <button
                        className="show-btn"
                        onClick={() => setSelectedRequest(request)}
                      >
                        Show
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
        {selectedRequest && (
          <div className="modalmanagereq">
            <h3>Request Details</h3>
            <p><strong>Name:</strong> {selectedRequest.name}</p>
            <p><strong>Description:</strong> {selectedRequest.description}</p>
            <p><strong>Contact Number:</strong> {selectedRequest.contactNumber}</p>
            <p><strong>Date Requested:</strong> {selectedRequest.createdAt}</p>
            <p><strong>Item Status:</strong>{selectedRequest.itemId?.STATUS}</p>
            <p><strong>Request Status:</strong></p>
            <select
  value={selectedRequest.status}
  onChange={(e) => handleStatusUpdate('request', selectedRequest.id, e.target.value)}
>
  <option value="Pending">Pending</option>
  <option value="Accepted">Accepted</option>
  <option value="Declined">Declined</option>
</select>

            <p><strong>Found Item Details:</strong></p>
            <li><strong>Item Name:</strong> {selectedRequest.itemId?.ITEM || 'N/A'}</li>
            <li><strong>Description:</strong> {selectedRequest.itemId?.DESCRIPTION || 'N/A'}</li>
            <li><strong>Date Found:</strong> {selectedRequest.itemId?.DATE_FOUND || 'N/A'}</li>
       
            <p><strong>Item Status:</strong>{selectedRequest.itemId?.STATUS}</p>
            <select
  value={selectedRequest.itemId?.STATUS || 'N/A'}
  onChange={(e) => handleStatusUpdate('item', selectedRequest.itemId?._id, e.target.value)}
>
  <option value="Unclaimed">Unclaimed</option>
  <option value="Claimed">Claimed</option>
</select>


            <button onClick={() => setSelectedRequest(null)} className="close-btn-managereq">Close</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageRequest;
