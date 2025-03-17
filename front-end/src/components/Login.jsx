import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../style/Login.css'; // Import CSS file

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    const response = await login(email, password, role);
    if (response.token) {
      if (role === 'super_admin') navigate('/super-admin-dashboard');
      else if (role === 'admin') navigate('/admin-dashboard');
      else if (role === 'user') navigate('/user-dashboard');
      else navigate('/store-owner-dashboard');
    } else {
      setError(response.error || 'Invalid login credentials');
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-title">Login</h2>
      <form className="login-form" onSubmit={handleLogin}>
        {error && <p className="error-message">{error}</p>}

        <label className="login-label">Select Role</label>
        <select className="login-select" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="super_admin">System Admin</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
          <option value="store_owner">Store Owner</option>
        </select>

        <label className="login-label">Email</label>
        <input
          className="login-input"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className="login-label">Password</label>
        <input
          className="login-input"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="login-button" type="submit">Login</button>

        <button className="signup" type="submit"><a href="/signup">New user</a></button>

      </form>
    </div>
  );
};

export default Login;
