import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter } from 'react-icons/fa';
import '../style/bulletinboard.css';
import '../style/reportmanage.css';
import Sidebar from './sidebar';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

function Bulletin() {
  const [filterText, setFilterText] = useState('');
  const [requests, setRequests] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [modalData, setModalData] = useState({
    name: '',
    description: '',
    contactNumber: '',
    id: '',
  });

  const [itemData, setItemData] = useState({
    ITEM: '',
    DESCRIPTION: '',
    DATE_FOUND: '',
    TIME_RETURNED: '',
    FINDER: '',
    CONTACT_OF_THE_FINDER: '',
    FOUND_LOCATION: '',
    OWNER: '',
    DATE_CLAIMED: '',
    STATUS: 'unclaimed',
    IMAGE_URL:'',
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get('http://10.10.83.224:5000/useritems');
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setModalData((prev) => ({ ...prev, [name]: value }));
  };

  const handleModalSubmit = async () => {
   

    const token = localStorage.getItem('token'); // Retrieve the token from localStorage
    if (!token) {
      console.error('No token found');
      return;
    }

    const decodedToken = jwtDecode(token); // Decode the token
    const userId = decodedToken.id; // Extract userId from the decoded token

    try {
      const response = await axios.post('http://10.10.83.224:5000/retrieval-request', {
        name: modalData.name,
        description: modalData.description,
        contactNumber: modalData.contactNumber,
        id: modalData.id,
        itemId: selectedItem._id, // Include the selected item ID
        userId: userId, // Include the user ID
      });

    
      setShowModal(false); // Close the modal after submission
    } catch (error) {
      console.error('Error submitting the form:', error);
    }
  };

  const filteredRequests = requests.filter((item) => {
    return item.ITEM && item.ITEM.toLowerCase().includes(filterText.toLowerCase());
  });

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const displayedRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="home-container">
      <Sidebar />
      <header className="header">
        <h2>FIRI LOGO</h2>
      </header>
      <div className="content">
        <div className="manage-bulletin">
          <div className="breadcrumb">Manage Lost and Found {'>'} Manage Found Items</div>
          <div className="top-right-buttons"></div>
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
          {displayedRequests.length > 0 ? (
            <table className="found-items-table">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Date Found</th>
                  <th>Location</th>
                  <th>Image</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedRequests.map((item) => (
                  <tr key={item._id}>
                    <td>{item.ITEM}</td>
                    <td>{item.DATE_FOUND}</td>
                    <td>{item.FOUND_LOCATION}</td>
                    <td>
  <img
    src={item.IMAGE_URL || "default-image-url"}
    alt="Product"
    style={{
      width: "100px",
      height: "100px",
      objectFit: "cover",
      borderRadius: "5px",//this is just optional image in here ,can be removed , should be added to be in a card format and bulletin pero blur siya dapat
      filter: "blur(2px)", // Adds a blur effect
    }}
  />
</td>
                    <td>
                      <button
                        className="bulletinview-btn"
                        onClick={() => {
                          setSelectedItem(item);
                          setShowModal(true);
                        }}
                      >
                        Request Retrieval
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-data">No matching requests found</div>
          )}
          <div className="pagination">
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                className="page-nav"
                onClick={() => handlePageChange(index + 1)}
                disabled={currentPage === index + 1}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="bulletinmodal-overlay">
          <div className="bulletinmodal">
            <h3>Request Retrieval</h3>
            <form>
              <label>
                Name:
                <input
                  type="text"
                  name="name"
                  value={modalData.name}
                  onChange={handleModalChange}
                  required
                />
              </label>
              <label>
                Description:
                <textarea
                  name="description"
                  value={modalData.description}
                  onChange={handleModalChange}
                  required
                ></textarea>
              </label>
              <label>
                Contact Number:
                <input
                  type="text"
                  name="contactNumber"
                  value={modalData.contactNumber}
                  onChange={handleModalChange}
                  required
                />
              </label>
              <label>
                ID:
                <input
                  type="text"
                  name="id"
                  value={modalData.id}
                  onChange={handleModalChange}
                  required
                />
              </label>
              <div className="bulletinmodal-buttons">
                <button type="button" onClick={handleModalSubmit}>
                  Submit
                </button>
                <button type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Bulletin;
