const Category = require('../models/category');
const Auth = require('../utilities/security');
const TextConvert = require('../utilities/textConvert');
const { v4: uuidv4 } = require('uuid');

exports.getCategories = async (req, res) => {
    try {
        const categoriesRawData = await Category.getCategories();
        const categories = [];
        for (const row of categoriesRawData) {
            let category = categories.find(c => c.id === row.ParentId);
            if (!category) {
                category = {
                    id: row.ParentId,
                    name: TextConvert.convertFromUnicodeEscape(row.ParentName),
                    child: []
                };
                categories.push(category);
            }

            if (row.ChildId) {
                category.child.push({
                    id: row.ChildId,
                    name: TextConvert.convertFromUnicodeEscape(row.ChildName)
                });
            }
        }
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addCategory = async (req, res) => {
    try {
        const requestBody = req.body;

        if (!Array.isArray(requestBody) || requestBody.length === 0) {
            return res.status(400).json({ error: 'Invalid request body' });
        }

        const converted = requestBody.map(item => ({
            name: TextConvert.convertToUnicodeEscape(item.name),
            child: (item.child || []).map(c => ({
                name: TextConvert.convertToUnicodeEscape(c.name)
            }))
        }));

        const inserted = await Category.addCategoriesBatch(converted);
        return res.status(201).json({ success: true, data: inserted });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error', detail: err.message });
    }
};