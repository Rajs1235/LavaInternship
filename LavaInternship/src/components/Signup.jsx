import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';


function Signup() {
   const [fullName, setfullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    
    try {
      const res = await api.post('/users/register', {
        fullName,
        username,
        email,
        password,
      });

      console.log('Signup successful:', res.data);
      navigate('/Login');
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.response?.data?.message || 'Signup failed. Try again.');
    }
  };

  return (
    <div className="space-y-8 min-h-[400px] flex flex-col justify-between">
      <div className="container">
        <div className="form_area">
          <p className="title">SIGN UP</p>

          <form onSubmit={handleSignup}>
            <div className="form_group">
              <label className="sub_title" htmlFor="name">FullName</label>
              <input
                placeholder="Enter your full name"
                id="name"
                className="form_style"
                type="text"
                value={fullName}
                onChange={(e) => setfullName(e.target.value)}
                required
              />
            </div>
      <div className="form_group">
              <label className="sub_title" htmlFor="name">UserName</label>
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
              <label className="sub_title" htmlFor="email">Email</label>
              <input
                placeholder="Enter your email"
                id="email"
                className="form_style"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              <button type="submit" className="btn">SIGN UP</button>
              <p>
                Have an Account?{' '}
                <Link className="link" to="/login">Login Here!</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;