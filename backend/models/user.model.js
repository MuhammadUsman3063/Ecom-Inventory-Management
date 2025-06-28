// backend/models/user.model.js
const { sql } = require('../db');

async function createUser(name, email, hashedPassword, role = 'Admin') {
  try {
    const result = await sql.query`
      INSERT INTO users (name, email, password, role)
      VALUES (${name}, ${email}, ${hashedPassword}, ${role})
    `;
    return result;
  } catch (err) {
    throw err;
  }
}

module.exports = {
  createUser,
};
