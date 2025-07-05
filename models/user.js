// models/user.js

const { sql, pool, poolConnect } = require('./db');

async function getUsers() {
    await poolConnect;
    const result = await pool.request().query('SELECT * FROM Users');
    return result.recordset;
}

async function createUser(id, username, name, hashedPassword, salt, status, createdAt) {
    await poolConnect;
    const result = await pool.request()
        .input('id', sql.UniqueIdentifier, id)
        .input('username', sql.VarChar, username)
        .input('name', sql.NVarChar, name)
        .input('password', sql.VarBinary, hashedPassword)
        .input('salt', sql.VarBinary, salt)
        .input('status', sql.VarChar, status)
        .input('createdAt', sql.DateTime, createdAt)
        .query('INSERT INTO Users (Id, Username, Name, Password, Salt, Status, CreatedAt) VALUES (@id, @username, @name, @password, @salt, @status, @createdAt)');
    return result;
}

async function getUserByUsername(username) {
    await poolConnect;
    const result = await pool.request()
        .input('username', sql.VarChar, username)
        .query('SELECT * FROM Users WHERE Username = @username');
    return result.recordset[0];
}

async function getUserById(id) {
    await poolConnect;
    const result = await pool.request()
        .input('id', sql.UniqueIdentifier, id)
        .query('SELECT * FROM Users WHERE Id = @id');
    return result.recordset[0];
}

module.exports = { getUsers, createUser, getUserByUsername, getUserById };
