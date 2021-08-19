const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const db = require("../db");

// POST /users/auth - returns a JWT when a successful username and password are sent
// GET /users/ - returns all of the users, requires a valid JWT
// GET /users/secure/:id - returns a simple messages, requires a valid JWT and the id in the URL has to match the id stored in the JWT

router.get("/", async (req, res) => {
  // Check auth
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ message: "unauthorized" });
    }

    try {
      const verify = jwt.verify(token, "secretJwt");
      if (verify) {
        const data = await db.query("SELECT * FROM users");
        return res.status(200).json(data.rows);
      }
      return res.status(401).json({ message: "unauthorized" });
    } catch (error) {
      return res.json({ message: "unverify" });
    }
  } catch (error) {
    res.status(401).json({ message: "unauthorizied" });
  }
});

router.post("/", async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 1);

  const data = await db.query(
    "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *",
    [username, hashedPassword]
  );

  return res.json(data.rows[0]);
});

router.patch("/:id", async (req, res) => {
  const { username, password } = req.body;
  const id = req.params.id;

  if (password) {
    var hashedPassword = await bcrypt.hash(password, 1);
  }

  if (username && password) {
    const data = await db.query(
      "UPDATE users SET username=$1, password=$2 WHERE id=$3 RETURNING *",
      [username, hashedPassword, id]
    );
  } else if (username) {
    const data = await db.query(
      "UPDATE users SET username=$1 WHERE id=$2 RETURNING *",
      [username, id]
    );
  } else if (password) {
    const data = await db.query(
      "UPDATE users SET password=$1 WHERE id=$2 RETURNING *",
      [hashedPassword, id]
    );
  }

  return res.json({ ...data.rows[0], password: undefined });
});

router.delete("/:id", async (req, res) => {
  const data = await db.query("DELETE FROM users WHERE id=$1", [req.params.id]);
  return res.json({ message: "Deleted" });
});

// router.post("/auth", async (req, res) => {
//   try {
//     const { username, password } = req.body;

//     const hashedPassword = await bcrypt.hash(password, 1);
//     console.log(hashedPassword);
//     // $2b$04$9G6YkUZSBJYNoSjRV0TEh.2/WW/vYjVfVdy.Olkd1D7uFftr1i0j

//     const user = await db.query(
//       `SELECT * FROM users WHERE username='${username}' AND password='${hashedPassword}'`
//     );

//     // console.log(user);

//     if (user.rows.length > 0) {
//       const token = await jwt.sign({ user_id: user.rows[0].id }, "secretJwt");

//       return res.status(200).json({ token: token });
//     }
//     return res.status(401).json({ message: "unauthorized" });
//   } catch (error) {
//     console.log(error);
//     res.json(error);
//   }
// });

// First getting hash of user then checking if password match
router.post("/auth", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await db.query(
      `SELECT * FROM users WHERE username='${username}'`
    );

    const hashedPassword = user.rows[0].password;

    const match = await bcrypt.compare(password, hashedPassword);

    if (match) {
      const token = await jwt.sign({ user_id: user.rows[0].id }, "secretJwt");
      return res.status(200).json({ token: token });
    }

    return res.status(401).json({ message: "unauthorized" });
  } catch (error) {
    console.log(error);
    res.json(error);
  }
});

// Secure check
router.get("/secure/:id", async (req, res) => {
  try {
    const token = req.headers.authorization;
    const id = req.params.id;

    if (token) {
      const { user_id } = await jwt.decode(token, "secretJwt");

      if (user_id == id) {
        return res.status(200).json({ message: "You made it!" });
      }
    }

    return res.status(401).json({ message: "unauthorized" });
  } catch (error) {
    return res.status(400).json({ error: error });
  }
});

module.exports = router;
