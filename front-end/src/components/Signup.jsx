import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/Signup.css';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
  });

  const [errors, setErrors] = useState({});

  // Validation Regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[A-Z])(?=.*[\W_]).{8,16}$/; // 8-16 chars, 1 uppercase, 1 special char

  const validateForm = () => {
    let newErrors = {};

    // Name validation (20-60 characters)
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    else if (formData.name.length < 5 || formData.name.length > 60)
      newErrors.name = 'Name must be between 20 and 60 characters';

    // Email validation
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!emailRegex.test(formData.email)) newErrors.email = 'Invalid email format';

    // Address validation (max 400 characters)
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    else if (formData.address.length > 400) newErrors.address = 'Address must be under 400 characters';

    // Password validation (8-16 characters, 1 uppercase, 1 special character)
    if (!formData.password) newErrors.password = 'Password is required';
    else if (!passwordRegex.test(formData.password))
      newErrors.password = 'Password must be 8-16 characters and include 1 uppercase letter and 1 special character';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await fetch('http://localhost:5000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        alert('Signup successful! Redirecting to login...');
        navigate('/');
      } else {
        setErrors({ email: data.error || 'Signup failed' });
      }
    } catch (error) {
      console.error('Signup error:', error);
      setErrors({ email: 'Something went wrong. Try again later' });
    }
  };

  return (
    <div className="signup-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit} className="signup-form">
        <div className="input-group">
          <label>Name:</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} />
          {errors.name && <p className="error-text">{errors.name}</p>}
        </div>

        <div className="input-group">
          <label>Email:</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} />
          {errors.email && <p className="error-text">{errors.email}</p>}
        </div>

        <div className="input-group">
          <label>Address:</label>
          <input type="text" name="address" value={formData.address} onChange={handleChange} />
          {errors.address && <p className="error-text">{errors.address}</p>}
        </div>

        <div className="input-group">
          <label>Password:</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} />
          {errors.password && <p className="error-text">{errors.password}</p>}
        </div>

        <button type="submit" className="signup-btn">Sign Up</button>
      </form>
    </div>
  );
};

export default Signup;
