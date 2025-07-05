// models/user.js

const { sql, pool, poolConnect } = require('./db');

async function getCategories() {
    await poolConnect;
    const result = await pool.request().query('SELECT Parent.Id AS ParentId, Parent.Name AS ParentName,Child.Id AS ChildId, Child.Name AS ChildName FROM Categories AS Parent LEFT JOIN Categories AS Child ON Child.ParentId = Parent.Id WHERE Parent.ParentId IS NULL ORDER BY Parent.Name, Child.Name');
    return result.recordset;
}

module.exports = { getCategories };
