const { sql, pool, poolConnect } = require('./db');

async function addProduct(productData) {
    await poolConnect;

    const request = new sql.Request(pool);

    request
        .input('Id', sql.UniqueIdentifier, productData.id)
        .input('Name', sql.NVarChar(300), productData.name)
        .input('SKU', sql.NVarChar(100), productData.sku)
        .input('Description', sql.NVarChar(sql.MAX), productData.description || '')
        .input('Status', sql.Bit, productData.status)
        .input('CategoryId', sql.UniqueIdentifier, productData.categoryId)
        .input('CreatedAt', sql.DateTime, productData.createdAt)
        .input('Size', sql.VarChar(200), productData.size)
        .input('SizeUnit', sql.VarChar(10), productData.sizeUnit);

    const result = await request.query(`
        INSERT INTO Products (Id, Name, SKU, Description, Status, CategoryId, CreatedAt, Size, SizeUnit)
        VALUES (@Id, @Name, @SKU, @Description, @Status, @CategoryId, @CreatedAt, @Size, @SizeUnit)
        SELECT * FROM Products WHERE Id = @Id
    `);

    return result.recordset[0];
}

module.exports = { addProduct };