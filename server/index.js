const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

const OpenAI = require("openai");

const cors = require("cors");

dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json());

const JWT_SECRET = "julie";

// Database connection
const db = mysql.createConnection({
  host: "bq3q3xl2n3acbrkfn3ih-mysql.services.clever-cloud.com",
  user: "ujybsr1ifek7fyqc",
  password: "ujybsr1ifek7fyqc",
  database: "bq3q3xl2n3acbrkfn3ih",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    process.exit(1);
  }
  console.log("Connected to MySQL database.");
});

// Hash passwords
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

// Middleware to authenticate JWT
const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).send({ message: "Unauthorized" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).send({ message: "Forbidden" });
    req.user = user;
    next();
  });
};

app.get("/", (req, res) => {
  console.log("API Running Successfully");
});

// User Registration
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).send({ message: "All fields are required." });
  }

  try {
    const hashedPassword = await hashPassword(password);
    const query =
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
    db.query(query, [username, email, hashedPassword], (err) => {
      if (err) {
        console.log(err);
        if (err.code === "ER_DUP_ENTRY") {
          return res
            .status(400)
            .send({ message: "Username or email already exists." });
        }
        return res.status(500).send({ message: "Database error." });
      }
      res.status(201).send({ message: "User registered successfully." });
    });
  } catch (error) {
    res.status(500).send({ message: "Error processing request." });
  }
});

// User Login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .send({ message: "Email and password are required." });
  }

  const query = "SELECT * FROM users WHERE email = ?";
  db.query(query, [email], async (err, results) => {
    if (err || results.length === 0) {
      return res.status(400).send({ message: "Invalid email or password." });
    }

    const user = results[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).send({ message: "Invalid email or password." });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.send({ token, username: user.username });
  });
});

// Chatbot Endpoint
app.post("/chat", authenticateJWT, async (req, res) => {
  const userId = req.user.id;
  const userMessage = req.body.message;

  if (!userMessage) {
    return res.status(400).send({ message: "Message cannot be empty." });
  }

  // Check predefined responses in the database
  const query = "SELECT answer FROM responses WHERE question = ?";
  db.query(query, [userMessage.toLowerCase()], async (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).send({ message: "Server error." });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    let botReply;
    if (results.length > 0) {
      botReply = results[0].answer;
    } else {
      // Fetch reply from ChatGPT API
      try {
        // const runPrompt = async () => {
        //   const response = await openai.completions.create({
        //     model: "gpt-3.5-turbo",
        //     prompt: userMessage.toLowerCase(),
        //     max_tokens: 2048,
        //     temperature: 1,
        //   });

        // botReply = response.data.choice[0].text;
        // console.log("answer", response.data);
        // };

        // await runPrompt();

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            {
              role: "user",
              content: userMessage.toLowerCase(),
            },
          ],
        });

        botReply = completion.choices[0].message.content;
      } catch (apiError) {
        console.error("Error from ChatGPT API:", apiError);
        botReply = "I'm having trouble understanding that. Please try again.";
      }
    }

    // Save chat history
    const insertHistoryQuery =
      "INSERT INTO chat_history (user_id, question, answer) VALUES (?, ?, ?)";
    db.query(insertHistoryQuery, [userId, userMessage, botReply], (err) => {
      if (err) {
        console.error("Error saving chat history:", err);
      }
    });

    res.send({ reply: botReply });
  });
});

// Fetch Chat History
app.get("/history", authenticateJWT, (req, res) => {
  const userId = req.user.id;
  const query =
    "SELECT question, answer, timestamp FROM chat_history WHERE user_id = ? ORDER BY timestamp DESC";

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching chat history:", err);
      return res.status(500).send({ message: "Server error." });
    }
    res.send(results);
  });
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
