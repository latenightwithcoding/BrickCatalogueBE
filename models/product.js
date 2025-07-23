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

async function getProducts({ categoryId }) {
    await pool.connect();

    let query = `
        SELECT 
            p.*, 
            (
                SELECT AttachmentURL
                FROM ProductAttachments a
                WHERE a.productId = p.id
                FOR JSON PATH
            ) AS images
        FROM Products p
        WHERE 1=1
    `;

    if (categoryId) {
        query += ` AND p.categoryId = @categoryId`;
    }

    const request = pool.request();

    if (categoryId) {
        request.input('categoryId', sql.UniqueIdentifier, categoryId);
    }

    const result = await request.query(query);

    // Parse JSON from `images` column
    // const products = result.recordset.map(p => ({
    //     ...p,
    //     images: p.images ? JSON.parse(p.images).map(img => img.AttachmentURL) : []
    // }));
    const products = result.recordset.map(p => ({
        Id: p.Id,
        SKU: p.SKU,
        Images: p.images
            ? JSON.parse(p.images).map(img => img.AttachmentURL)
            : []
    }));

    return products;
}



module.exports = { addProduct, getProducts };