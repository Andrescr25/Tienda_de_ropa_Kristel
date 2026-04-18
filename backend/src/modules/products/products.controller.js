const service = require('./products.service');

// GET /api/products?limit=10&startAfter=<id>&categoryId=<id>
const list = async (req, res, next) => {
  try {
    const { limit, startAfter, categoryId } = req.query;
    const result = await service.getProducts({ limit, startAfter, categoryId });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// GET /api/products/:id
const getById = async (req, res, next) => {
  try {
    const product = await service.getProductById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

// POST /api/products  [ADMIN]
const create = async (req, res, next) => {
  try {
    const product = await service.createProduct(req.body);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

// PUT /api/products/:id  [ADMIN]
const update = async (req, res, next) => {
  try {
    const product = await service.updateProduct(req.params.id, req.body);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/products/:id  [ADMIN] — soft delete
const remove = async (req, res, next) => {
  try {
    const ok = await service.deleteProduct(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deactivated successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { list, getById, create, update, remove };
