require('dotenv').config();

const path = require('path');
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');

const { pool } = require('./config/db');
const { ensureDatabaseReady } = require('./config/bootstrapDb');
const sessionStore = require('./config/sessionStore');
const indexRoutes = require('./routes/index');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const { syncSessionCartToDb } = require('./models/cartModel');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    key: 'flower_shop_sid',
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
      sameSite: 'lax'
    }
  })
);

app.use(flash());

app.use(async (req, res, next) => {
  try {
    res.locals.currentUser = req.session.user || null;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentPath = req.path;
    res.locals.cartCount = 0;

    if (!req.session.cart) {
      req.session.cart = [];
    }

    if (req.session.user && req.session.cart.length) {
      await syncSessionCartToDb(req.session.user.id, req.session.cart);
      req.session.cart = [];
    }

    if (req.session.user) {
      const [rows] = await pool.execute(
        `SELECT COALESCE(SUM(ci.quantity), 0) AS total
         FROM cart c
         LEFT JOIN cart_items ci ON ci.cart_id = c.id
         WHERE c.user_id = ?`,
        [req.session.user.id]
      );
      res.locals.cartCount = Number(rows[0].total || 0);
    } else {
      res.locals.cartCount = req.session.cart.reduce((sum, item) => sum + item.quantity, 0);
    }

    next();
  } catch (error) {
    next(error);
  }
});

app.use('/', indexRoutes);
app.use(notFound);
app.use(errorHandler);

async function startServer() {
  try {
    await ensureDatabaseReady();
    await pool.query('SELECT 1');

    app.listen(PORT, () => {
      console.log(`Server is running on ${process.env.APP_URL || `http://localhost:${PORT}`}`);
    });
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}

startServer();
