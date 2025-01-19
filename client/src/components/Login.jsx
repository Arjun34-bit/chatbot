import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Spinner from "../Spinner/Spinner";
import { URL } from "../constants/constants";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post(`${URL}/login`, {
        email,
        password,
      });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("username", response.data.username);
      setLoading(false);
      alert("Login successful!");
      navigate("/chat");
    } catch (error) {
      setLoading(false);
      alert("Login failed: " + error.response.data.message);
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
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
            "Login"
          )}
        </button>
        <div className="signup">
          <span style={{ marginTop: "10px" }}>
            Don't you have an account?
            <Link className="link" to="/register">
              Register
            </Link>
          </span>
        </div>
      </form>
    </div>
  );
}

export default Login;
