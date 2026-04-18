require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { errorHandler } = require('./middlewares/error.middleware');
const usersRouter = require('./modules/users/users.router');
const productsRouter = require('./modules/products/products.router');
const categoriesRouter = require('./modules/categories/categories.router');
const ordersRouter = require('./modules/orders/orders.router');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Global Middlewares ──────────────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// ─── Routes ──────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'OK', timestamp: new Date().toISOString() }));
app.use('/api/users', usersRouter);
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/orders', ordersRouter);

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
