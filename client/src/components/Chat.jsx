import React, { useState, useEffect } from "react";
import axios from "axios";
import Spinner from "../Spinner/Spinner";
import { URL } from "../constants/constants";

function Chat() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchingLoading] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    // Fetch chat history on load
    const fetchHistory = async () => {
      try {
        setFetchingLoading(true);
        const response = await axios.get(`${URL}/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFetchingLoading(false);
        setHistory(response.data);
      } catch (error) {
        setFetchingLoading(false);
        console.error("Error fetching chat history:", error);
      }
    };
    fetchHistory();
  }, [token]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setChat((prevChat) => [...prevChat, { user: "You", message }]);
    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:5000/chat",
        { message },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChat((prevChat) => [
        ...prevChat,
        { user: "Bot", message: response.data.reply },
      ]);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error sending message:", error);
    }
    setMessage("");
  };

  return (
    <div className="chat-container">
      <h2>Welcome, {localStorage.getItem("username")}</h2>

      <div className="chat-box">
        {chat.map((c, index) => (
          <div
            key={index}
            className={c.user === "You" ? "chat-user" : "chat-bot"}
          >
            <strong>{c.user}:</strong> {c.message}
          </div>
        ))}
        {loading ? (
          <span className="fetch-load">
            <Spinner
              loading={loading}
              size={8}
              color={"black"}
              spinner={"sync"}
            />
          </span>
        ) : (
          ""
        )}
      </div>

      <form onSubmit={sendMessage}>
        <input
          type="text"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
        <button type="submit">Send</button>
      </form>

      <h3>Chat History</h3>
      {fetchLoading ? (
        <div className="loading">
          <Spinner
            loading={fetchLoading}
            size={92}
            color={"#0000"}
            spinner={""}
          />
        </div>
      ) : (
        <div className="history-box">
          {history.map((h, index) => (
            <div key={index}>
              <strong>You:</strong> {h.question} <br />
              <strong>Bot:</strong> {h.answer} <br />
              <small>{new Date(h.timestamp).toLocaleString()}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Chat;
