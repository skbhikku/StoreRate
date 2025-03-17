require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

const pool = new Pool({
  user: "",
  host: "",
  database: "",
  password: "",
  port: 5432,
});

// 🔹 Login Endpoint
app.post("/login", async (req, res) => {
  const { email, password, role } = req.body;

  try {
    // 🔥 Direct admin login bypass
    if (
      email === "admin@example.com" &&
      password === "123" &&
      role === "super_admin"
    ) {
      return res.json({
        message: "Admin login successful",
        role: "admin",
        token: "admin-token",
      });
    }

    // Determine the correct table based on role
    let tableName = "";
    if (role === "admin") {
      tableName = "admins";
    } else if (role === "user") {
      tableName = "users";
    } else if (role === "store_owner") {
      tableName = "store_owners"; // Adjust if needed
    } else {
      return res.status(400).json({ error: "Invalid role selected" });
    }

    // Query the selected table
    const queryText = `SELECT * FROM ${tableName} WHERE email = $1`;
    const user = await pool.query(queryText, [email]);

    if (user.rows.length === 0) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const userData = user.rows[0];

    // 🔐 Direct password comparison (NO HASHING)
    if (password !== userData.password) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    res.json({ message: "Login successful", role, token: `${role}-token` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

//user register
app.post("/signup", async (req, res) => {
  const { name, email, address, password } = req.body;

  try {
    // Check if email already exists
    const userExists = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash password

    // Insert user into database
    const newUser = await pool.query(
      "INSERT INTO users (name, email, address, password) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, email, address, password]
    );

    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error registering user" });
  }
});

// 🔹 System Admin Dashboard Endpoint (Fetch all admin, users, and store data)
app.get("/super-admin-dashboard", async (req, res) => {
  try {
    const admins = await pool.query("SELECT * FROM admins");
    const users = await pool.query("SELECT * FROM users");
    const stores = await pool.query("SELECT * FROM store_owners"); // Adjust if needed

    res.json({
      admins: admins.rows,
      users: users.rows,
      stores: stores.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching admin dashboard data" });
  }
});

//Admin Dashboard Endpoint (Fetch all users and store data)
app.get("/admin-dashboard", async (req, res) => {
  try {
    const users = await pool.query("SELECT * FROM users");
    const stores = await pool.query("SELECT * FROM store_owners"); // Adjust if needed

    res.json({
      users: users.rows,
      stores: stores.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching admin dashboard data" });
  }
});

//Avalibile Store display for userDashboard and user rating submited or not
app.get("/user-dashboard/stores/:userEmail", async (req, res) => {
  const { userEmail } = req.params;

  try {
    const stores = await pool.query(
      `
      SELECT 
        so.id, 
        so.store_name, 
        so.address AS store_address, 
        ROUND(so.rating / NULLIF(so.count_rating, 0), 1) AS average_rating, 
        so.count_rating AS total_ratings,
        r.rating AS user_rating  
      FROM store_owners so
      LEFT JOIN ratings r ON so.store_name = r.store_name AND r.user_email = $1
      ORDER BY average_rating DESC NULLS LAST
    `,
      [userEmail]
    );

    res.json({ stores: stores.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching store data" });
  }
});

//Reviews of the store
app.get("/store-owner/reviews/:storeName", async (req, res) => {
  try {
    const { storeName } = req.params;

    console.log("Fetching reviews for store:", storeName); // Debugging

    if (!storeName) {
      return res.status(400).json({ error: "Store name is required" });
    }

    // ✅ Fixed query
    const reviews = await pool.query(
      "SELECT user_email, rating FROM ratings WHERE store_name = $1",
      [storeName]
    );

    console.log("Fetched reviews:", reviews.rows); // Debugging

    if (reviews.rows.length === 0) {
      return res.status(404).json({ error: "No reviews found for this store" });
    }

    res.json(reviews.rows);
  } catch (error) {
    console.error("Database error:", error.message);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

//Store display in user Dashboard
app.post("/rate-store/:storeId", async (req, res) => {
  const { storeId } = req.params;
  const { rating, userEmail } = req.body;

  try {
    // Get store name
    const storeResult = await pool.query(
      "SELECT store_name FROM store_owners WHERE id = $1",
      [storeId]
    );
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: "Store not found" });
    }
    const storeName = storeResult.rows[0].store_name;

    // Check if user already rated this store
    const existingRating = await pool.query(
      "SELECT rating FROM ratings WHERE store_name = $1 AND user_email = $2",
      [storeName, userEmail]
    );

    if (existingRating.rows.length > 0) {
      // User already rated - Update the rating
      const oldRating = existingRating.rows[0].rating;
      await pool.query(
        "UPDATE ratings SET rating = $1 WHERE store_name = $2 AND user_email = $3",
        [rating, storeName, userEmail]
      );

      // Adjust total rating in store_owners table
      await pool.query(
        "UPDATE store_owners SET rating = rating - $1 + $2 WHERE id = $3",
        [oldRating, rating, storeId]
      );

      return res.json({ message: "Rating updated successfully" });
    } else {
      // New rating - Insert into ratings table
      await pool.query(
        "INSERT INTO ratings (store_name, user_email, rating) VALUES ($1, $2, $3)",
        [storeName, userEmail, rating]
      );

      // Update total rating and count in store_owners table
      await pool.query(
        "UPDATE store_owners SET rating = rating + $1, count_rating = count_rating + 1 WHERE id = $2",
        [rating, storeId]
      );

      return res.json({ message: "Rating submitted successfully" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error submitting rating" });
  }
});

// 🔹 Add User Endpoint
app.post("/add-user", async (req, res) => {
  const { name, email, password, address } = req.body;
  try {
    await pool.query(
      "INSERT INTO users (name, email, password, address) VALUES ($1, $2, $3, $4)",
      [name, email, password, address]
    );
    res.json({ message: "User added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error adding user" });
  }
});

// 🔹 Add Store Owner & Store Endpoint
app.post("/add-store-owner", async (req, res) => {
  const { name, email, password, store_name, address } = req.body;
  try {
    await pool.query(
      "INSERT INTO store_owners (name, email, password, store_name, address) VALUES ($1, $2, $3, $4, $5)",
      [name, email, password, store_name, address]
    );
    res.json({ message: "Store owner added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error adding store owner" });
  }
});

// 🔹 Add Admin Endpoint
app.post("/add-admin", async (req, res) => {
  const { name, email, password, address, role } = req.body;
  try {
    await pool.query(
      "INSERT INTO admins (name, email, password, address, role) VALUES ($1, $2, $3, $4, $5)",
      [name, email, password, address, role]
    );
    res.json({ message: "Admin added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error adding admin" });
  }
});

//store owner
app.get("/store-owner/:email", async (req, res) => {
  const { email } = req.params;

  try {
    const storeOwner = await pool.query(
      "SELECT * FROM store_owners WHERE email = $1",
      [email]
    );

    if (storeOwner.rows.length === 0) {
      return res.status(404).json({ error: "Store owner not found" });
    }

    res.json(storeOwner.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching store owner details" });
  }
});

//Store owner profile update
app.put("/store-owner/update/:email", async (req, res) => {
  const { email } = req.params;
  const { name, store_name, password, address } = req.body;

  try {
    const result = await pool.query(
      "UPDATE store_owners SET name = $1, store_name = $2, password = $3, address = $4 WHERE email = $5 RETURNING *",
      [name, store_name, password, address, email]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Store owner not found" });
    }

    res.json({
      message: "Profile updated successfully",
      storeOwner: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error updating store owner details" });
  }
});

// 🔹 Fetch Admin Profile
app.get("/admin/:email", async (req, res) => {
  const { email } = req.params;

  try {
    const admin = await pool.query("SELECT * FROM admins WHERE email = $1", [
      email,
    ]);

    if (admin.rows.length === 0) {
      return res.status(404).json({ error: "Admin not found" });
    }

    res.json(admin.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching admin details" });
  }
});

// 🔹 Update Admin Profile
app.put("/admin/update/:email", async (req, res) => {
  const { email } = req.params;
  const { name, password, address } = req.body;

  try {
    const result = await pool.query(
      "UPDATE admins SET name = $1, password = $2, address = $3 WHERE email = $4 RETURNING *",
      [name, password, address, email]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Admin not found" });
    }

    res.json({
      message: "Profile updated successfully",
      admin: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error updating admin details" });
  }
});

//user
app.get("/user/:email", async (req, res) => {
  const { email } = req.params;

  try {
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (user.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log("User fetched:", user.rows[0]); // Debugging
    res.json(user.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching user details" });
  }
});

//user updating profile
app.put("/user/update/:email", async (req, res) => {
  const { email } = req.params;
  const { name, password, address } = req.body;

  try {
    const result = await pool.query(
      "UPDATE users SET name = $1, password = $2, address = $3 WHERE email = $4 RETURNING *",
      [name, password, address, email]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "Profile updated successfully", user: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error updating user details" });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
