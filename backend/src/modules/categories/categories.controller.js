const service = require('./categories.service');

// GET /api/categories
const list = async (req, res, next) => {
  try {
    res.json(await service.getCategories());
  } catch (err) { next(err); }
};

// POST /api/categories  [ADMIN]
const create = async (req, res, next) => {
  try {
    res.status(201).json(await service.createCategory(req.body));
  } catch (err) { next(err); }
};

// PUT /api/categories/:id  [ADMIN]
const update = async (req, res, next) => {
  try {
    const cat = await service.updateCategory(req.params.id, req.body);
    if (!cat) return res.status(404).json({ error: 'Category not found' });
    res.json(cat);
  } catch (err) { next(err); }
};

// DELETE /api/categories/:id  [ADMIN]
const remove = async (req, res, next) => {
  try {
    const ok = await service.deleteCategory(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Category not found' });
    res.json({ message: 'Category deleted successfully' });
  } catch (err) { next(err); }
};

module.exports = { list, create, update, remove };
