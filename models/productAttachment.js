const { sql, pool, poolConnect } = require('./db');
const { v4: uuidv4 } = require('uuid');

async function addProductImages(imagesData) {
    await poolConnect;

    const insertedImages = [];

    const transaction = new sql.Transaction(pool);
    try {
        await transaction.begin();

        for (let i = 0; i < imagesData.length; i++) {
            const img = imagesData[i];
            const request = new sql.Request(transaction);

            request
                .input('Id', sql.UniqueIdentifier, img.id || uuidv4())
                .input('ProductId', sql.UniqueIdentifier, img.productId)
                .input('Type', sql.VarChar(50), img.type || 'image')
                .input('Url', sql.VarChar(500), img.attachmentURL)

            const result = await request.query(`
                INSERT INTO ProductAttachments (Id, ProductId, Type, AttachmentURL)
                VALUES (@Id, @ProductId, @Type, @Url);
                SELECT * FROM ProductAttachments WHERE Id = @Id
            `);

            insertedImages.push(result.recordset[0]);
        }

        await transaction.commit();
        return insertedImages;

    } catch (err) {
        await transaction.rollback();
        throw err;
    }
}

module.exports = { addProductImages };
