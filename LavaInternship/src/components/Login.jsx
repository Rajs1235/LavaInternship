import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Link,NavLink } from 'react-router-dom';
// import api from '../api'; // Uncomment and adjust as needed
import Signup from './Signup';
function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // If you want to prefill role from signup, you can use location.state?.role

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Uncomment and adjust for your backend
      // const res = await api.post('/users/login', { username, password });
      // const { role } = res.data.user;
      let role = 'student'; // mock for demo, replace with real role from response
      if (username === 'hr') role = 'hr';
      if (role === 'student') {
        navigate('/studentform');
      } else if (role === 'hr') {
        navigate('/dashboard');
      } else {
        setError('Unknown role');
      }
    } catch (err) {
      setError('Login failed. Try again.');
    }
  };

  return (
    <div className="container">
      <div className="form_area">
        <p className="title">LOGIN</p>
        <form onSubmit={handleLogin}>
          <div className="form_group">
            <label className="sub_title" htmlFor="username">UserName</label>
            <input
              placeholder="Enter your Username"
              id="username"
              className="form_style"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form_group">
            <label className="sub_title" htmlFor="password">Password</label>
            <input
              placeholder="Enter your password"
              id="password"
              className="form_style"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
          )}
          <div>
            <button type="submit" className="btn">LOGIN</button>
            <p>
              Don't have an account?{' '}
              <Link className="link" to="/Signup">Sign Up Here!</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
