import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import '../style/UserDashboard.css';

const UserDashboard = () => {
  const { user, setUser } = useContext(AuthContext);
  const [stores, setStores] = useState([]);
  const [ratings, setRatings] = useState({});
  const [activeTab, setActiveTab] = useState("home");
  const [editing, setEditing] = useState(false);

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    address: "",
    password: ""
  });

  // Fetch user profile data from backend
  useEffect(() => {
    if (user?.email) {
      fetch(`http://localhost:5000/user/${user.email}`)
        .then((res) => res.json())
        .then((data) => setProfileData(data))
        .catch((err) => console.error("Error fetching profile:", err));
    }
  }, [user]);

  // Fetch stores and user ratings
  useEffect(() => {
    if (user && user.email) {
      fetch(`http://localhost:5000/user-dashboard/stores/${user.email}`)
        .then((res) => res.json())
        .then((data) => {
          setStores(data.stores);
          const ratingsMap = {};
          data.stores.forEach((store) => {
            if (store.user_rating !== null) {
              ratingsMap[store.id] = store.user_rating;
            }
          });
          setRatings(ratingsMap);
        })
        .catch((err) => console.error("Error fetching stores:", err));
    }
  }, [user]);

  const toggleEdit = () => setEditing(!editing);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const submitProfileUpdate = async () => {
    try {
      const response = await fetch(`http://localhost:5000/user/update/${user.email}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Profile updated successfully!");
        setUser({ ...user, ...profileData });
        setEditing(false);
      } else {
        alert(data.error || "Failed to update profile.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleRatingChange = (storeId, value) => {
    setRatings({ ...ratings, [storeId]: value });
  };

  const submitRating = async (storeId) => {
    if (!user || !user.email) {
      alert("You must be logged in to submit a rating.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/rate-store/${storeId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: ratings[storeId], userEmail: user.email }),
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        fetch(`http://localhost:5000/user-dashboard/stores/${user.email}`)
          .then((res) => res.json())
          .then((data) => setStores(data.stores));
      } else {
        alert(data.error || "Failed to submit rating.");
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      alert("Error submitting rating.");
    }
  };

  return (
    <div className="user-dashboard">
      <div className="dashboard-header">
        <h2>User Dashboard</h2>
        <a href="http://localhost:3000/" className="logout-link">Logout</a>
      </div>

      {user && <h4 className="user-email">Email: {profileData.email}</h4>}

      <nav className="nav-bar">
        <button 
          className={`nav-button ${activeTab === "home" ? "active" : ""}`}
          onClick={() => setActiveTab("home")}
        >
          Home
        </button>
        <button 
          className={`nav-button ${activeTab === "updateProfile" ? "active" : ""}`}
          onClick={() => setActiveTab("updateProfile")}
        >
          Update Profile
        </button>
      </nav>

      {activeTab === "home" && (
        <div className="store-container">
          <h3>Available Stores</h3>
          {stores.length === 0 ? (
            <p className="no-stores">No stores available</p>
          ) : (
            <ul className="store-list">
              {stores.map((store) => (
                <li key={store.id} className="store-item">
                  <div className="store-header">
                    <h3 className="store-name">{store.store_name}</h3>
                    <p className="store-address">📍 Address: {store.store_address}</p>
                    <p className="store-rating">
                      ⭐ Average Rating: {store.average_rating || "No ratings yet"} 
                      ({store.total_ratings} reviews)
                    </p>
                  </div>

                  <div className="user-rating">
                    {ratings[store.id] !== undefined ? (
                      <p className="rating-status">✅ Your Rating: {ratings[store.id]}</p>
                    ) : (
                      <p className="rating-status">❌ You haven't rated this store yet</p>
                    )}

                    <div className="rating-container">
                      <div className="star-rating">
                        {[5, 4, 3, 2, 1].map((value) => (
                          <label
                            key={value}
                            className="star-label"
                            style={{
                              color: ratings[store.id] >= value ? "#FFD700" : "#ccc",
                            }}
                          >
                            ★
                            <input
                              type="radio"
                              className="star-input"
                              name={`rating-${store.id}`}
                              value={value}
                              checked={ratings[store.id] === value}
                              onChange={() => handleRatingChange(store.id, value)}
                            />
                          </label>
                        ))}
                      </div>

                      <button
                        className="rating-button"
                        onClick={() => submitRating(store.id)}
                      >
                        {ratings[store.id] !== undefined ? "Update Rating" : "Submit Rating"}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {activeTab === "updateProfile" && (
        <div className="profile-section">
          <h2>Update Your Profile</h2>
          {editing ? (
            <form className="profile-form">
              <input
                className="form-input"
                type="text"
                name="name"
                value={profileData.name}
                onChange={handleProfileChange}
                placeholder="Full Name"
              />
              <input
                className="form-input"
                type="email"
                name="email"
                value={profileData.email}
                disabled
              />
              <input
                className="form-input"
                type="text"
                name="phone"
                value={profileData.address}
                onChange={handleProfileChange}
                placeholder="Phone Number"
              />
              <input
                className="form-input"
                type="password"
                name="password"
                value={profileData.password}
                onChange={handleProfileChange}
                placeholder="New Password"
              />
              <div className="form-actions">
                <button
                  type="button"
                  className="form-button primary"
                  onClick={submitProfileUpdate}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="form-button secondary"
                  onClick={toggleEdit}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-info">
              <p><strong>Name:</strong> {profileData.name}</p>
              <p><strong>Email:</strong> {profileData.email}</p>
              <p><strong>Phone:</strong> {profileData.address}</p>
              <button
                className="form-button primary"
                onClick={toggleEdit}
              >
                Edit Profile
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;