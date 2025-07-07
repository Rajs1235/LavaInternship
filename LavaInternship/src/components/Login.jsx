import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.post("/users/login", { username, password });

      const { user, accesstoken, refreshtoken } = response.data.data;
      console.log("Login successful. Access token:", accesstoken);

      if (!accesstoken) {
        throw new Error("Access token missing in response.");
      }

      // ✅ Store tokens and user data
      localStorage.setItem("token", accesstoken);
      localStorage.setItem("refreshToken", refreshtoken); // optional
      localStorage.setItem("userProfile", JSON.stringify(user));
      localStorage.setItem("userId", user._id);

      // ✅ Redirect based on onboarding status
      if (user.onboardingComplete) {
        navigate("/dashboard");
      } else {
        navigate("/onboarding");
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.response?.data?.message || "Login failed. Please try again.");
    }
  };

  return (
    <div className="space-y-8 min-h-[400px] flex flex-col justify-between">
      <div className="container">
        <div className="form_area">
          <p className="title">LOGIN</p>

          <form onSubmit={handleLogin}>
            <div className="form_group">
              <label className="sub_title" htmlFor="username">Username</label>
              <input
                id="username"
                className="form_style"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="form_group">
              <label className="sub_title" htmlFor="password">Password</label>
              <input
                id="password"
                className="form_style"
                type="password"
                placeholder="Enter your password"
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
                Don’t have an account?{' '}
                <Link className="link" to="/signup">Sign Up Here!</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

}

export default Login;