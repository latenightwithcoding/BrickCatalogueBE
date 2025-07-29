const TextConvert = require('../utilities/textConvert');
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
        .input('SizeUnit', sql.VarChar(10), productData.sizeUnit)
        .input('UnsignName', sql.NVarChar(300), productData.unsignName);

    const result = await request.query(`
        INSERT INTO Products (Id, Name, SKU, Description, Status, CategoryId, CreatedAt, Size, SizeUnit, UnsignName)
        VALUES (@Id, @Name, @SKU, @Description, @Status, @CategoryId, @CreatedAt, @Size, @SizeUnit, @UnsignName)
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
        id: p.Id,
        sku: p.SKU,
        images: p.images
            ? JSON.parse(p.images).map(img => img.AttachmentURL)
            : []
    }));

    return products;
}

async function getProduct(productId) {
    await poolConnect;

    const request = new sql.Request(pool);
    request.input('productId', sql.UniqueIdentifier, productId);

    const result = await request.query(`
        SELECT 
            p.Id, p.Name, p.Description, p.SKU, p.Size, p.SizeUnit,
            c.Id AS CategoryId,
            c.Name AS CategoryName,
            (
                SELECT AttachmentURL
                FROM ProductAttachments a
                WHERE a.ProductId = p.Id
                FOR JSON PATH
            ) AS images,
            (
                SELECT 
                    rp.Id, rp.SKU,
                    (
                        SELECT AttachmentURL
                        FROM ProductAttachments pa
                        WHERE pa.ProductId = rp.Id
                        FOR JSON PATH
                    ) AS images
                FROM Products rp
                WHERE rp.CategoryId = p.CategoryId AND rp.Id != p.Id
                ORDER BY rp.CreatedAt DESC
                OFFSET 0 ROWS FETCH NEXT 4 ROWS ONLY
                FOR JSON PATH
            ) AS relatedProducts
        FROM Products p
        LEFT JOIN Categories c ON p.CategoryId = c.Id
        WHERE p.Id = @productId
    `);

    if (result.recordset.length === 0) {
        throw new Error('Product not found');
    }

    const product = result.recordset[0];

    return {
        id: product.Id,
        name: TextConvert.convertFromUnicodeEscape(product.Name),
        description: TextConvert.convertFromUnicodeEscape(product.Description),
        sku: product.SKU,
        size: product.Size,
        sizeUnit: product.SizeUnit,
        category: {
            id: product.CategoryId,
            name: TextConvert.convertFromUnicodeEscape(product.CategoryName),
        },
        images: product.images ? JSON.parse(product.images).map(img => img.AttachmentURL) : [],
        relatedProducts: product.relatedProducts
            ? JSON.parse(product.relatedProducts).map(p => ({
                id: p.Id,
                sku: p.SKU,
                images: p.images ? p.images.map(img => img.AttachmentURL) : [],
            }))
            : [],
    };
}

async function getProductsForAdmin({ search = '', page = 1, pageSize = 10 }) {
    await poolConnect;

    const request = new sql.Request(pool);

    const offset = (page - 1) * pageSize;
    const searchKeyword = `%${TextConvert.convertToUnSign(search)}%`;

    request.input('search', sql.VarChar, searchKeyword);
    request.input('pageSize', sql.Int, pageSize);
    request.input('offset', sql.Int, offset);

    // Truy vấn chính
    const dataResult = await request.query(`
        SELECT 
            p.Id, p.Name, p.SKU, p.Description, p.Size, p.SizeUnit,
            c.Id AS CategoryId,
            c.Name AS CategoryName, (
                SELECT AttachmentURL
                FROM ProductAttachments a
                WHERE a.ProductId = p.Id
                FOR JSON PATH
            ) AS images
        FROM Products p
        LEFT JOIN Categories c ON p.CategoryId = c.Id
        WHERE (@search = '' OR p.UnsignName LIKE @search OR p.SKU LIKE @search)
        ORDER BY p.CreatedAt DESC
        OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY;
    `);

    // Truy vấn đếm tổng số bản ghi
    const countRequest = new sql.Request(pool);
    countRequest.input('search', sql.VarChar, searchKeyword);

    const countResult = await countRequest.query(`
        SELECT COUNT(*) AS total
        FROM Products p
        WHERE (@search = '' OR p.UnsignName LIKE @search OR p.SKU LIKE @search);
    `);

    const totalItems = countResult.recordset[0].total;
    const totalPages = Math.ceil(totalItems / pageSize);

    return {
        page,
        totalPages,
        totalItems,
        items: dataResult.recordset.map(p => ({
            id: p.Id,
            name: TextConvert.convertFromUnicodeEscape(p.Name),
            sku: p.SKU,
            description: TextConvert.convertFromUnicodeEscape(p.Description),
            size: p.Size,
            sizeUnit: p.SizeUnit,
            category: {
                id: p.CategoryId,
                name: TextConvert.convertFromUnicodeEscape(p.CategoryName),
            },
            images: p.images ? JSON.parse(p.images).map(img => img.AttachmentURL) : []
        }))
    };
}


module.exports = { addProduct, getProducts, getProduct, getProductsForAdmin };