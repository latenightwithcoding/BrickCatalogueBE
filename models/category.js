// models/user.js

const TextConvert = require('../utilities/textConvert');
const { sql, pool, poolConnect } = require('./db');
const { v4: uuidv4 } = require('uuid');

async function getCategories() {
    await poolConnect;
    const result = await pool.request().query('SELECT Parent.Id AS ParentId, Parent.Name AS ParentName,Child.Id AS ChildId, Child.Name AS ChildName FROM Categories AS Parent LEFT JOIN Categories AS Child ON Child.ParentId = Parent.Id WHERE Parent.ParentId IS NULL ORDER BY Parent.[Index], Child.[Index]');
    return result.recordset;
}

async function addCategoriesBatch(rawCategories) {
    await poolConnect;

    const transaction = new sql.Transaction(pool);
    try {
        await transaction.begin();

        const inserted = [];
        const warnings = [];

        const getMaxIndexRequest = new sql.Request(transaction);
        const maxIndexResult = await getMaxIndexRequest.query(
            `SELECT ISNULL(MAX([Index]), 0) AS LastIndex FROM Categories WHERE ParentId IS NULL`
        );
        let currentParentIndex = maxIndexResult.recordset[0].LastIndex;

        for (let i = 0; i < rawCategories.length; i++) {
            const item = rawCategories[i];
            const parentName = item.name;
            let parentId;

            const checkParentRequest = new sql.Request(transaction);
            const checkResult = await checkParentRequest
                .input('Name', sql.NVarChar(300), parentName)
                .query(`SELECT Id FROM Categories WHERE Name = @Name AND ParentId IS NULL`);

            if (checkResult.recordset.length > 0) {
                parentId = checkResult.recordset[0].Id;
            } else {
                parentId = uuidv4();
                currentParentIndex += 1; // Tăng chỉ số danh mục cha

                const insertParentRequest = new sql.Request(transaction);
                await insertParentRequest
                    .input('Id', sql.UniqueIdentifier, parentId)
                    .input('Name', sql.NVarChar(300), parentName)
                    .input('ParentId', sql.UniqueIdentifier, null)
                    .input('Index', sql.Int, currentParentIndex)
                    .query(`INSERT INTO Categories (Id, Name, ParentId, [Index]) VALUES (@Id, @Name, @ParentId, @Index)`);

                inserted.push({
                    id: parentId,
                    name: TextConvert.convertFromUnicodeEscape(parentName),
                    parentId: null,
                    index: currentParentIndex
                });
            }

            const children = item.child || [];
            for (let j = 0; j < children.length; j++) {
                const child = children[j];
                const childName = child.name;

                const checkChildRequest = new sql.Request(transaction);
                const checkChild = await checkChildRequest
                    .input('Name', sql.NVarChar(300), childName)
                    .input('ParentId', sql.UniqueIdentifier, parentId)
                    .query(`SELECT Id FROM Categories WHERE Name = @Name AND ParentId = @ParentId`);

                if (checkChild.recordset.length > 0) {
                    warnings.push({
                        parent: TextConvert.convertFromUnicodeEscape(parentName),
                        child: TextConvert.convertFromUnicodeEscape(childName),
                        message: 'Child category already exists under this parent. Skipped.'
                    });
                    continue;
                }

                const childId = uuidv4();
                const insertChildRequest = new sql.Request(transaction);
                await insertChildRequest
                    .input('Id', sql.UniqueIdentifier, childId)
                    .input('Name', sql.NVarChar(300), childName)
                    .input('ParentId', sql.UniqueIdentifier, parentId)
                    .input('Index', sql.Int, j)
                    .query(`INSERT INTO Categories (Id, Name, ParentId, [Index]) VALUES (@Id, @Name, @ParentId, @Index)`);

                inserted.push({
                    id: childId,
                    name: TextConvert.convertFromUnicodeEscape(childName),
                    parentId: parentId,
                    index: j
                });
            }
        }

        await transaction.commit();
        return { inserted, warnings };
    } catch (err) {
        await transaction.rollback();
        throw err;
    }
}


module.exports = { getCategories, addCategoriesBatch };
