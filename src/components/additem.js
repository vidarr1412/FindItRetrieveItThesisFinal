import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaFilter } from 'react-icons/fa';
import Sidebar from "./sidebar";
import '../style/additem.css';
import axios from 'axios';
import { storage } from "../firebase"; // Import Firebase storage
import { ref, uploadBytesResumable, uploadString,getDownloadURL } from "firebase/storage"; 
function Additem() {
  const [filterText, setFilterText] = useState('');
  const [requests, setRequests] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
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
    IMAGE_URL: '',  // Store image URL
  });

  const [image, setImage] = useState(null); // State to hold the captured image
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    startCamera();
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get('http://10.10.83.224:5000/items');
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setItemData({ ...itemData, [name]: value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    // Step 1: Upload the image to Firebase Storage if available
    let imageUrl = itemData.IMAGE_URL; // Default to existing URL if any
    if (image) {
      const imageRef = ref(storage, `images/${Date.now()}.png`);
      try {
        await uploadString(imageRef, image, 'data_url');
        const downloadURL = await getDownloadURL(imageRef);
        imageUrl = downloadURL; // Update the URL
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }

    // Step 2: Update itemData with the image URL
    const updatedData = { ...itemData, IMAGE_URL: imageUrl };

    try {
      if (selectedItem) {
        await axios.put(`http://10.10.83.224:5000/items/${selectedItem._id}`, updatedData);
      } else {
        const response = await axios.post('http://10.10.83.224:5000/items', updatedData);
        setRequests([...requests, response.data]);
      }
      setShowModal(false);
      fetchItems();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://10.10.83.224:5000/items/${id}`);
      fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const openModal = (item = null) => {
    setSelectedItem(item);
    setItemData(
      item || {
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
        IMAGE_URL: '',
      }
    );
    setShowModal(true);
    startCamera(); // Automatically start the camera
  };

  const startCamera = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        })
        .catch((err) => {
          console.error('Error accessing the camera', err);
        });
    }
  };

  const captureImage = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL('image/png'); // Capturing the image in base64 format
      setImage(imageData); // Set the captured image to state
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
          <div className="top-right-buttons">
            <button className="add-item-btn" onClick={() => openModal()}>+ Add Found Item</button>
     
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
          {displayedRequests.length > 0 ? (
            <table className="found-items-table">
              <thead>
                <tr>
                  <th>Finder</th>
                  <th>Item Name</th>
                  <th>Description</th>
                  <th>Contact</th>
                  <th>Date Found</th>
                  <th>Location</th>
                  <th>Time</th>
                  <th>Owner</th>
                  <th>Status</th>
                  <th>Image</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedRequests.map((item) => (
                  <tr key={item._id}>
                    <td>{item.FINDER}</td>
                    <td>{item.ITEM}</td>
                    <td>{item.DESCRIPTION}</td>
                    <td>{item.CONTACT_OF_THE_FINDER}</td>
                    <td>{item.DATE_FOUND}</td>
                    <td>{item.FOUND_LOCATION}</td>
                    <td>{item.TIME_RETURNED}</td>
                    <td>{item.OWNER}</td>
                    <td>
  <img
    src={item.IMAGE_URL || "default-image-url"}
    alt="Product"
    style={{
      width: "100px",
      height: "100px",
      objectFit: "cover",
      borderRadius: "5px",//this is just optional image in here ,can be removed , should be added to be in a card format and bulletin pero blur siya dapat
      //filter: "blur(0px)", // Adds a blur effect
    }}
  />
</td>

                    <td>{item.STATUS}</td>
                    <td>
                      <button className="view-btn" onClick={() => openModal(item)}>View More</button>
                      <button className="edit-btn" onClick={() => openModal(item)}>Edit</button>
                      <button className="delete-btn" onClick={() => handleDelete(item._id)}>Delete</button>
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
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            {/* Camera Section */}
            <div className="camera-section">
              <video ref={videoRef} width="320" height="240" autoPlay />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              <button onClick={startCamera}>Start Camera</button>
              <button onClick={captureImage}>Capture Image</button>
              {image && <img src={image} alt="Captured" />}
            </div>

            {/* Form Section */}
            <form onSubmit={handleFormSubmit}>
              <div>
                <label>Item Name</label>
                <input
                  type="text"
                  name="ITEM"
                  value={itemData.ITEM}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label>Description</label>
                <input
                  type="text"
                  name="DESCRIPTION"
                  value={itemData.DESCRIPTION}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label>Date Found</label>
                <input
                  type="date"
                  name="DATE_FOUND"
                  value={itemData.DATE_FOUND}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label>Time Returned</label>
                <input
                  type="time"
                  name="TIME_RETURNED"
                  value={itemData.TIME_RETURNED}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label>Finder</label>
                <input
                  type="text"
                  name="FINDER"
                  value={itemData.FINDER}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label>Contact</label>
                <input
                  type="text"
                  name="CONTACT_OF_THE_FINDER"
                  value={itemData.CONTACT_OF_THE_FINDER}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label>Location</label>
                <input
                  type="text"
                  name="FOUND_LOCATION"
                  value={itemData.FOUND_LOCATION}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label>Owner</label>
                <input
                  type="text"
                  name="OWNER"
                  value={itemData.OWNER}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label>Date Claimed</label>
                <input
                  type="date"
                  name="DATE_CLAIMED"
                  value={itemData.DATE_CLAIMED}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label>Status</label>
                <select
                  name="STATUS"
                  value={itemData.STATUS}
                  onChange={handleInputChange}
                >
                  <option value="unclaimed">Unclaimed</option>
                  <option value="claimed">Claimed</option>
                </select>
              </div>
              <button type="submit">Submit</button>
              <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Additem;
