import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "../style/StoreOwnerDashboard.css"; // Import CSS

const StoreOwnerDashboard = () => {
  const { user } = useContext(AuthContext);
  const [storeOwner, setStoreOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("home"); // Track active tab
  const [reviews, setReviews] = useState([]); // Store reviews
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    store_name: "",
    password: "",
    address: "",
  });

  useEffect(() => {
    const fetchStoreOwner = async () => {
      try {
        const response = await fetch(`http://localhost:5000/store-owner/${user.email}`);
        const data = await response.json();

        if (response.ok) {
          setStoreOwner(data);
          setFormData({
            name: data.name,
            email: data.email,
            store_name: data.store_name,
            password: data.password,
            address: data.address,
          });
        } else {
          console.error("Error fetching store owner:", data.error);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.email) {
      fetchStoreOwner();
    }
  }, [user?.email]);

  // Fetch reviews from ratings table
  useEffect(() => {
    const fetchReviews = async () => {
      if (storeOwner?.store_name) {
        try {
          const response = await fetch(`http://localhost:5000/store-owner/reviews/${storeOwner.store_name}`);
          const data = await response.json();

          if (response.ok) {
            setReviews(data);
          } else {
            console.error("Error fetching reviews:", data.error);
          }
        } catch (error) {
          console.error("Error:", error);
        }
      }
    };

    fetchReviews();
  }, [storeOwner?.store_name]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch(`http://localhost:5000/store-owner/update/${user.email}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStoreOwner(data.storeOwner);
        setEditMode(false);
      } else {
        console.error("Error updating profile:", data.error);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="dashboard-container">
      {/* Navbar */}
      <nav className="navbar">
        <button className={activeTab === "home" ? "active" : ""} onClick={() => setActiveTab("home")}>
          Home
        </button>
        <button className={activeTab === "updateProfile" ? "active" : ""} onClick={() => setActiveTab("updateProfile")}>
          Update Profile
        </button>
        <button className={activeTab === "viewReviews" ? "active" : ""} onClick={() => setActiveTab("viewReviews")}>
          View Reviews
        </button>
        <button className="logout">
          <a href="/">Logout</a>
        </button>
      </nav>

      {/* Home Tab */}
      {activeTab === "home" && (
        <div className="home-section">
          <h2>Welcome to your store powered by Roxiler</h2>
          <div className="store-details">
            <p><strong>Store Name:</strong> {storeOwner.store_name}</p>
            <p><strong>Email:</strong> {storeOwner.email}</p>
            <p><strong>Address:</strong> {storeOwner.address}</p>
            <p><strong>Rating:</strong> {storeOwner.rating ? (storeOwner.rating / storeOwner.count_rating).toFixed(1) : "No Ratings Yet"}</p>
            <p><strong>Total Ratings:</strong> {storeOwner.count_rating}</p>
          </div>
        </div>
      )}

      {/* Update Profile Tab */}
      {activeTab === "updateProfile" && (
        <div className="profile-container">
          <h2 className="profile-title">Update Your Profile</h2>
          <div className="profile-card">
            <label>Name:</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} disabled={!editMode} />

            <label>Email:</label>
            <input type="email" name="email" value={formData.email} disabled />

            <label>Store Name:</label>
            <input type="text" name="store_name" value={formData.store_name} onChange={handleChange} disabled={!editMode} />

            <label>Address:</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} disabled={!editMode} />

            <label>Password:</label>
            <input type="text" name="password" value={formData.password} onChange={handleChange} disabled={!editMode}/>

            <label>Rating:</label>
            <input type="text" value={storeOwner.rating ? (storeOwner.rating / storeOwner.count_rating).toFixed(1) : "No Ratings Yet"} disabled />

            <div className="button-container">
              {editMode ? (
                <button className="save-btn" onClick={handleUpdate}>Save Changes</button>
              ) : (
                <button className="edit-btn" onClick={() => setEditMode(true)}>Edit Profile</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* View Reviews Tab */}
      {activeTab === "viewReviews" && (
  <div className="reviews-container">
    <h2>Customer Reviews</h2>
    {reviews.length > 0 ? (
      <div className="table-responsive">
        <table className="reviews-table">
          <thead>
            <tr>
              <th>#</th>
              <th>User Email</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{review.user_email}</td>
                <td>{review.rating}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <p>No reviews available yet.</p>
    )}
  </div>
)}

    </div>
  );
};

export default StoreOwnerDashboard;
