import React, { useEffect, useState } from 'react';
import '../style/SuperAdminDashboard.css'

export default function SuperAdminDashboard() {
  const [data, setData] = useState({ admins: [], users: [], stores: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', address: '', store_name: '', role: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/super-admin-dashboard');
        const result = await response.json();
        setData(result);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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



  const validateForm = (isStoreOwner = false, isAdmin = false) => {
    const { name, email, password, address, store_name, role } = formData;
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
    if (!passwordRegex.test(password)) {
      newErrors.password = "Password must be 8-16 characters, include at least one uppercase letter and one special character.";
    }

    if (isStoreOwner && store_name.trim() === '') {
      newErrors.store_name = "Store name is required.";
    }

    if (isAdmin && role.trim() === '') {
      newErrors.role = "Role is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  
  if (loading) {
    return <h2 className="loading">Loading...</h2>;
  }
  return (
    <div className="dashboard-container">
      <nav className="navbar">
        {['home', 'admins', 'users', 'stores'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={activeTab === tab ? 'nav-button active' : 'nav-button'}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>

        ))}
         {/* Logout Button */}
         <button className="logout-button" ><a href="/">Logout</a>
          
        </button>
      </nav>
      {activeTab === 'home' && (
        <section className="admin-section">
          <h1 className="admin-dashboard-title">System Admin Dashboard</h1>


          {/* Add Admin Form */}
          <div className="form-container">
            <h2 className="form-title">Add Admin</h2>
            <form className="admin-form" onSubmit={(e) => { e.preventDefault(); handleSubmit('add-admin', false, true); }}>
              <input className="form-input" name="name" placeholder="Name" onChange={handleInputChange} required />
              <span className="error">{errors.name}</span>

              <input className="form-input" name="email" placeholder="Email" onChange={handleInputChange} required />
              <span className="error">{errors.email}</span>

              <input className="form-input" name="password" type="password" placeholder="Password" onChange={handleInputChange} required />
              <span className="error">{errors.password}</span>

              <input className="form-input" name="address" placeholder="Address" onChange={handleInputChange} required />
              <span className="error">{errors.address}</span>

              <input className="form-input" name="role" placeholder="Role" onChange={handleInputChange} required />
              <span className="error">{errors.role}</span>

              <button className="form-button" type="submit">Add Admin</button>
              <span className="success">{errors.form}</span>
            </form>
          </div>
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


      {activeTab === 'admins' && (
        <section className="section">
          <h2>Admins</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Address</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {data.admins.map((admin) => (
                <tr key={admin.id}>
                  <td>{admin.name}</td>
                  <td>{admin.email}</td>
                  <td>{admin.address}</td>
                  <td>{admin.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {activeTab === 'users' && (
        <section className="section">
          <h2>Users</h2>
          <table className="data-table">
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

      {activeTab === 'stores' && (
        <section className="section">
          <h2>Stores</h2>
          <table className="data-table">
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
    </div>
  );
}
