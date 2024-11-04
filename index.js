const express = require("express");
const pool = require("./db");

const app = express();

app.use(express.json());

/** ---> Home route */
app.get("/", async (req, res) => {
  res.status(200).json({ success: true, message: "Welcome to home route." });
});

/** ---> Test connection */
app.get("/test-connection", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.status(200).json({
      success: true,
      message: "Connection successful!",
      time: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Connection failed." });
  }
});

/** ---> Crud routes */

// ---> create user
app.post("/users", async (req, res, next) => {
  const { name, email, age } = req.body;

  try {
    const newUser = await pool.query(
      "INSERT  into users (name, email, age) VALUES ($1, $2, $3) RETURNING *",
      [name, email, age]
    );
    res
      .status(201)
      .json({ success: true, message: "User created.", user: newUser.rows[0] });
  } catch (error) {
    next(error);
  }
});

// ---> get all users
app.get("/users", async (req, res, next) => {
  try {
    const users = await pool.query("SELECT * FROM users");
    res
      .status(200)
      .json({ success: true, message: "Users fetched.", users: users.rows });
  } catch (error) {
    next(error);
  }
});

// ---> get  user by id
app.get("/users/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    if (user.rows.length === 0) {
      res.status(404).json({ success: false, message: "User not found." });
    }
    res
      .status(200)
      .json({ success: true, message: "User fetched.", user: user.rows[0] });
  } catch (error) {
    next(error);
  }
});

// ---> update  user by id
app.put("/users/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, age } = req.body;

    const user = await pool.query(
      "UPDATE users set name = $1, email = $2, age = $3 WHERE id = $4 RETURNING *",
      [name, email, age, id]
    );
    if (user.rows.length === 0) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }
    res
      .status(200)
      .json({ success: true, message: "User fetched.", user: user.rows[0] });
  } catch (error) {
    next(error);
  }
});

// ---> delete  user by id
app.delete("/users/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await pool.query(
      "DELETE FROM users  WHERE id = $1 RETURNING *",
      [id]
    );

    if (user.rows.length === 0) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    res
      .status(200)
      .json({ success: true, message: "User deleted.", user: user.rows[0] });
  } catch (error) {
    next(error);
  }
});

/** ---> Handling not found 404 routes */
app.use("*", (req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

/** ---> Handling error globally */
app.use((err, req, res) => {
  try {
    console.log("err :::->", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong.",
      error: err.message,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Something went wrong.", error });
  }
});

/** ---> Listening server */
app.listen(3331, () => {
  console.log("[::] Listening on http://localhost:3331");
});
