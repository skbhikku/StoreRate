import { useEffect, useState, useContext } from "react";
import  '../style/AdminDashboard.css';
import { AuthContext } from "../context/AuthContext";

export default function AdminDashboard() {
  const [data, setData] = useState({ admins: [], users: [], stores: [] });
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [adminProfile, setAdminProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    store_name: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/admin-dashboard');
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const response = await fetch(`http://localhost:5000/admin/${user.email}`);
        const result = await response.json();
        setAdminProfile(result);
        setFormData({
          name: result.name,
          email: result.email,
          password: '',
          address: result.address || '',
        });
      } catch (error) {
        console.error('Error fetching admin profile:', error);
      }
    };
    if (user?.email) {
      fetchAdminProfile();
    }
  }, [user?.email]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const { name, email, password, address } = formData;
    let newErrors = {};

    if (name.length < 5 || name.length > 60) {
      newErrors.name = "Name must be between 5 and 60 characters.";
    }

    if (address.length > 400) {
      newErrors.address = "Address must not exceed 400 characters.";
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[\W_]).{8,16}$/;
    if (password && !passwordRegex.test(password)) {
      newErrors.password = "Password must be 8-16 characters, include at least one uppercase letter and one special character.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (endpoint) => {
    if (!validateForm()) return;

    try {
      const response = await fetch(`http://localhost:5000/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      alert(result.message);
      window.location.reload();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleUpdateProfile = async () => {
    if (!validateForm()) return;

    try {
      const response = await fetch(`http://localhost:5000/admin/update/${user.email}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (response.ok) {
        setAdminProfile(result);
        setEditMode(false);
        alert("Profile updated successfully!");
      } else {
        alert("Error updating profile!");
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (loading) {
    return <h2 className="admin-loading">Loading...</h2>;
  }

  return (
    <div className="admin-dashboard-container">
      <nav className="admin-navbar">
        {['home', 'users', 'stores', 'profile'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`admin-nav-button ${activeTab === tab ? 'active' : ''}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
        <button className="admin-nav-button admin-logout-button">
          <a href="/">Logout</a>
        </button>
      </nav>

      {activeTab === 'home' && (
        <section className="admin-section">
          <h1 className="admin-dashboard-title">Admin Dashboard</h1>

          {/* Add User Form */}
          <div className="admin-form-container">
            <h2 className="admin-form-title">Add User</h2>
            <form
              className="admin-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit('add-user');
              }}
            >
              <input className="admin-form-input" name="name" placeholder="Name" onChange={handleInputChange} required />
              <span className="error">{errors.name}</span>

              <input className="admin-form-input" name="email" placeholder="Email" onChange={handleInputChange} required />
              <span className="error">{errors.email}</span>

              <input className="admin-form-input" name="password" type="password" placeholder="Password" onChange={handleInputChange} required />
              <span className="error">{errors.password}</span>

              <input className="admin-form-input" name="address" placeholder="Address" onChange={handleInputChange} required />
              <span className="error">{errors.address}</span>

              <button className="admin-form-button" type="submit">Add User</button>
              <span className="success">{errors.form}</span>
            </form>
          </div>

          {/* Add Store Owner Form */}
          <div className="admin-form-container">
            <h2 className="admin-form-title">Add Store Owner</h2>
            <form
              className="admin-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit('add-store-owner', true);
              }}
            >
              <input className="admin-form-input" name="name" placeholder="Name" onChange={handleInputChange} required />
              <span className="error">{errors.name}</span>

              <input className="admin-form-input" name="email" placeholder="Email" onChange={handleInputChange} required />
              <span className="error">{errors.email}</span>

              <input className="admin-form-input" name="password" type="password" placeholder="Password" onChange={handleInputChange} required />
              <span className="error">{errors.password}</span>

              <input className="admin-form-input" name="store_name" placeholder="Store Name" onChange={handleInputChange} required />
              <span className="error">{errors.store_name}</span>

              <input className="admin-form-input" name="address" placeholder="Address" onChange={handleInputChange} required />
              <span className="error">{errors.address}</span>

              <button className="admin-form-button" type="submit">Add Store Owner</button>
              <span className="success">{errors.form}</span>
            </form>
          </div>
        </section>
      )}

         

          {/* Users Section */}
      {activeTab === 'users' && (
        <section className="admin-section">
          <h2>Users</h2>
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {data.users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Stores Section */}
      {activeTab === 'stores' && (
        <section className="admin-section">
          <h2>Stores</h2>
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Store Name</th>
                <th>Address</th>
                <th>Rating</th>
                <th>Reviews</th>
              </tr>
            </thead>
            <tbody>
              {data.stores.map((store) => (
                <tr key={store.id}>
                  <td>{store.name}</td>
                  <td>{store.email}</td>
                  <td>{store.store_name}</td>
                  <td>{store.address}</td>
                  <td>{store.rating}</td>
                  <td>{store.count_rating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}


      {activeTab === 'profile' && adminProfile && (
        <section className="admin-section">
          <h2>Admin Profile</h2>
          <div className="profile-container">
            <label>Name:</label>
            <input type="text" name="name" value={formData.name} onChange={handleInputChange} disabled={!editMode} />

            <label>Email:</label>
            <input type="email" name="email" value={formData.email} disabled />

            <label>Address:</label>
            <input type="text" name="address" value={formData.address} onChange={handleInputChange} disabled={!editMode} />

            <label>Password:</label>
            <input type="password" name="password" value={formData.password} onChange={handleInputChange} disabled={!editMode} placeholder="Enter new password" />

            <div className="button-container">
              {editMode ? (
                <button className="save-btn" onClick={handleUpdateProfile}>Save Changes</button>
              ) : (
                <button className="edit-btn" onClick={() => setEditMode(true)}>Edit Profile</button>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
