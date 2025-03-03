import React, { useState, useEffect, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import Sidebar from "./sidebar";
import { storage, db, uploadBytesResumable, getDownloadURL, ref, doc, updateDoc } from "../firebase";
import { QRCodeCanvas } from "qrcode.react";
import "../style/prof.css";

function Profile() {
  const [user, setUser] = useState({
  

  });
  const qrCodeRef = useRef(null); // Reference for QRCodeCanvas
  const [selectedFile, setSelectedFile] = useState(null);
  const token = localStorage.getItem("token");
  let userId = null;

  if (token) {
    try {
      const decoded = jwtDecode(token);
      userId = decoded.id;
    } catch (error) {
      console.error("Invalid token:", error);
    }
  }

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;
      try {
        const response = await fetch(`http://10.10.83.224:5000/profile/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setUser({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          image_Url: data.image_Url || "prof.jpg",
          contactNumber:data.contactNumber||"",
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, [userId, token]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !userId) {
      alert("Please select an image first.");
      return;
    }

    const fileName = `${userId}-${selectedFile.name}`;
    const storageRef = ref(storage, `profileImages/${fileName}`);

    const uploadTask = uploadBytesResumable(storageRef, selectedFile);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(`Upload is ${progress}% done`);
      },
      (error) => {
        console.error("Upload error:", error);
        alert("An error occurred while uploading.");
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log("File available at", downloadURL);

          alert("Avatar uploaded successfully!");

          setUser((prev) => ({ ...prev, image_Url: downloadURL }));

          const userRef = doc(db, "users", userId);
          await updateDoc(userRef, { image_Url: downloadURL });
        } catch (error) {
          console.error("Error fetching download URL:", error);
        }
      }
    );
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!userId) {
      alert("User ID not found.");
      return;
    }

    if (user.password && user.password !== user.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch(`http://10.10.83.224:5000/update-profile/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          password: user.password,
          contactNumber:user.contactNumber,
          image_Url: user.image_Url,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        alert("Profile updated successfully!");
      } else {
        alert(result.message || "Error updating profile.");
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("An error occurred while updating profile.");
    }
  };

  const downloadQRCode = () => {
    const canvas = qrCodeRef.current; // Reference to the QRCodeCanvas component
    if (canvas && canvas.querySelector("canvas")) {
      const qrCanvas = canvas.querySelector("canvas");
      
      // Create a new canvas to apply the background and border
      const newCanvas = document.createElement('canvas');
      const context = newCanvas.getContext('2d');
      
      const padding = 20; // Padding value
      const size = 150 + padding * 2; // Adjust size based on padding
      newCanvas.width = size;
      newCanvas.height = size;
  
      // Set the background color and draw a border
      context.fillStyle = 'white';
      context.fillRect(0, 0, newCanvas.width, newCanvas.height); // White background
      context.lineWidth = 2;
      context.strokeStyle = 'black';
      context.strokeRect(0, 0, newCanvas.width, newCanvas.height); // Black border
  
      // Draw the original QR code onto the new canvas with padding
      context.drawImage(qrCanvas, padding, padding, 150, 150);
  
      // Convert the canvas to an image and trigger the download
      const imageURL = newCanvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = imageURL;
      link.download = `${userId}-QRCode.png`; // Download the QR code with user ID
      link.click();
    } else {
      alert("QR Code not available!");
    }
  };
  

  return (
    <div className="home-container1">
      <Sidebar />
      <div className="profile-container">
        <div className="profile-sidebar">
          <div className="profile-avatar">
            <h2>Profile</h2>
            <img src={user.image_Url} alt="Profile Avatar" className="avatar-image" />
            <h3>{user.firstName} {user.lastName}</h3>
            <input type="file" accept="image/*" id="fileInput" style={{ display: "none" }} onChange={handleImageChange} />
            <button className="change-avatar-button" onClick={() => document.getElementById("fileInput").click()}>
              Choose Avatar
            </button>
            <p>{selectedFile ? selectedFile.name : "No file chosen"}</p>
            <button onClick={handleUpload}>Upload Avatar</button>
          </div>
        </div>

        <div className="profile-form">
          <h3>Profile Update</h3>
          <form onSubmit={handleUpdate}>
            <div className="form-group">
              <label>First Name</label>
              <input type="text" value={user.firstName} onChange={(e) => setUser({ ...user, firstName: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input type="text" value={user.lastName} onChange={(e) => setUser({ ...user, lastName: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" value={user.email} onChange={(e) => setUser({ ...user, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Contact Number</label>
              <input type="text" value={user.contactNumber} onChange={(e) => setUser({ ...user, contactNumber: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Password (Leave blank to keep current password)</label>
              <input 
                type="password" 
                value={user.password} 
                onChange={(e) => setUser({ ...user, password: e.target.value })}  
              />
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input 
                type="password" 
                value={user.confirmPassword} 
                onChange={(e) => setUser({ ...user, confirmPassword: e.target.value })}  
              />
            </div>

            <div className="form-group">
              <label>QR Code</label>
              {userId && (
                <div ref={qrCodeRef}>
                  <QRCodeCanvas value={userId} size={150} />
                </div>
              )}
            </div>
            <button type="button" onClick={downloadQRCode}>Download QR Code</button>

            <button type="submit" className="save-button">Save</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile;
