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