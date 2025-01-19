import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Spinner from "../Spinner/Spinner";
import { URL } from "../constants/constants";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post(`${URL}/register`, {
        username,
        email,
        password,
      });
      setLoading(false);
      alert("Registration successful!");
      navigate("/");
    } catch (error) {
      setLoading(false);
      alert("Registration failed: " + error.response.data.message);
    }
  };

  return (
    <div className="auth-container">
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
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
        <button type="submit">
          {loading ? (
            <Spinner loading={loading} size={20} color={"#ffff"} spinner={""} />
          ) : (
            "Register"
          )}
        </button>
        <div className="signup">
          <span>
            Don't you have an account?
            <Link className="link" to="/">
              Login
            </Link>
          </span>
        </div>
      </form>
    </div>
  );
}

export default Register;
