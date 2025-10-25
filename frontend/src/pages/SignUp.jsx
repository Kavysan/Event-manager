import { useState } from "react";
import api from "../api/axios"; // your axios instance
import { useNavigate, Link } from "react-router-dom";
import "../css/Signup.css";

function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await api.post("/user/", { name, email, password });
      setSuccess("✅ Signup successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      if (err.response?.status === 400) {
        setError(err.response.data.detail); 
      } else {
        setError("Signup failed. Please try again.");
      }
    }
  };

  return (
    <div className="signup-container">
        <h2>Sign Up</h2>
        {error && <p style={{ color: "black" }}>{error}</p>}
        {success && <p style={{ color: "blue" }}>{success}</p>}
        <form onSubmit={handleSignup} className="signup-form">
            <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Sign Up</button>
      </form>
      <p className="redirect-text">
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
}

export default SignUp;
