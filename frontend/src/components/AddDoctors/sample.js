const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser'); 
const app = express();
const PORT = process.env.PORT || 8000;
const userModel = require('./models/user');
const bcrypt = require('bcrypt');
const path = require('path');  // Import the path module
const jwt = require('jsonwebtoken');
const Post = require("./models/post"); // Import the schema
const multer = require('multer');
const sanitizeHtml = require("sanitize-html");

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Storage Setup for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Save files in the 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  }
});


const upload = multer({ storage: storage });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); //  Use cookie-parser middleware
app.use(
  cors({
    credentials: true,
    origin: 'http://localhost:3000', // matches frontend URL
  })
);

const salt = bcrypt.genSaltSync(10);
const secret = 'sjkdfcshdbsbhjvdjbzzbchjbsahdzjbhxcj';

// Database Connection
mongoose
  .connect('mongodb://localhost:27017/Blogging')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Register Route
app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await userModel.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({
        message: existingUser.username === username ? 'Username already exists. Try Again' : 'Email already exists. Try Again',
      });
    }

    const hashedPassword = bcrypt.hashSync(password, salt);
    const newUser = await userModel.create({ username, email, password: hashedPassword });

    // ✅ Generate JWT token upon successful registration
    jwt.sign({ username: newUser.username, id: newUser._id }, secret, {}, (err, token) => {
      if (err) {
        console.error('JWT Sign Error:', err);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
      }

      // ✅ Set token as a cookie for auto-login
      res
        .cookie('token', token, { httpOnly: true, sameSite: 'strict' })
        .status(201)
        .json({ success: true, user: newUser, message: 'Registered and logged in successfully' });
    });

  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// Login Route
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const userDoc = await userModel.findOne({ email });

    if (!userDoc) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (!passOk) {
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }

    // ✅ Fix JWT sign issue
    jwt.sign({ username: userDoc.username, id: userDoc._id }, secret, {}, (err, token) => {
      if (err) {
        console.error('JWT Sign Error:', err);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
      }

      // ✅ Correct way to send cookie and response together
      res
        .cookie('token', token, { httpOnly: true, sameSite: 'strict' }) // Set cookie properly
        .status(200)
        .json({ success: true, message: 'Login successful' });
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

app.get('/profile', (req, res) => {
  const { token } = req.cookies;
  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
  }
  jwt.verify(token, secret, {}, (err, info) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Unauthorized: Invalid token' });
    }
    res.json(info);
  });
});


app.post('/logout', (req, res) => {
  res.cookie('token', ''); // Clear the token
  res.status(200).json({ success: true, message: "Logged out successfully" });
});


app.post("/createpost", upload.single("file"), async (req, res) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    jwt.verify(token, secret, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: "Unauthorized: Invalid token" });
      }

      const { title, summary, content, blogType } = req.body;
      const file = req.file ? req.file.filename : null;

      if (!title || !summary || !content || !blogType) {
        return res.status(400).json({ error: "All fields are required" });
      }

      // ✅ Automatically set author as logged-in user
      const newPost = new Post({
        title,
        summary,
        content,
        blogType,
        file,
        author: decoded.username, // Set author to the logged-in username
      });

      await newPost.save();
      res.status(201).json({ message: "Post created successfully!", post: newPost });
    });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});




//Display all Posts
app.get('/allpost', async (req, res) => {
  try {
    const alldata = await Post.find({}); // Await the query to resolve
    return res.json({ alldata });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

//single Post
app.get('/post/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const post = await Post.findOne({ _id: id }); // ✅ Correct MongoDB syntax

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/updatepost/:id", upload.single("file"), async (req, res) => {
  try {
    const { title, summary, content, blogType } = req.body;
    const file = req.file ? `/uploads/${req.file.filename}` : undefined;

    // Remove HTML tags from content
    const plainTextContent = sanitizeHtml(content, {
      allowedTags: [], // No HTML tags allowed
      allowedAttributes: {},
    });

    const updateFields = { title, summary, content: plainTextContent, blogType };
    if (file) updateFields.image = file;

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json({ message: "Post updated successfully", post: updatedPost });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});




app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});








import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./create.css";

function Create() {
  const [title, setTitle] = useState("");  
  const [summary, setSummary] = useState(""); 
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);
  const [blogType, setBlogType] = useState("");
  const [author, setAuthor] = useState("");  // Fetch logged-in user
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    async function fetchUser() {
      const response = await fetch("http://localhost:8000/getuser", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const userData = await response.json();
        setAuthor(userData.username); // Set author as logged-in user
      }
    }

    fetchUser();
  }, []);

  async function createNewPost(ev) {
    ev.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("summary", summary);
    formData.append("content", content);
    formData.append("blogType", blogType);
    formData.append("author", author); // Set author automatically
    if (file) {
      formData.append("file", file);
    }

    const response = await fetch("http://localhost:8000/createpost", {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (response.ok) {
      
      alert("Post Created Successfully!");
      setTitle("");
      setSummary("");
      setContent("");
      setBlogType("");
      setFile(null);
      navigate('/'); 
    } else {
      alert("Failed to Create Post!");
    }
  }

  return (
    <div className="createPost">
      <form className="createPost-form" onSubmit={createNewPost}>
        <input 
          type="text" 
          placeholder="Title" 
          value={title} 
          onChange={(ev) => setTitle(ev.target.value)} 
        />
        <input 
          type="text" 
          placeholder="Summary" 
          value={summary} 
          onChange={(ev) => setSummary(ev.target.value)} 
        />
        <input 
          type="file" 
          onChange={(ev) => setFile(ev.target.files[0])} 
        />

        {/* Radio Buttons for Blog Type */}
        <div className="blogType-options">
          {["technology", "lifestyle", "food", "travel", "education"].map((type) => (
            <label key={type}>
              <input 
                type="radio" 
                value={type} 
                checked={blogType === type} 
                onChange={(ev) => setBlogType(ev.target.value)} 
              />
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </label>
          ))}
        </div>

        {/* ReactQuill Editor */}
        <ReactQuill 
          value={content} 
          onChange={setContent} 
          theme="snow" 
          className="reactquill"
        />

        <button type="submit">Create Post</button>
      </form>
    </div>
  );
}

export default Create;
