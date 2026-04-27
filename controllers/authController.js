const bcrypt = require('bcrypt');
const UserModel = require('../models/userModel');
const { syncSessionCartToDb } = require('../models/cartModel');

class AuthController {
  static renderRegisterPage(req, res) {
    res.render('auth/register', { title: 'Регистрация', old: {} });
  }

  static async register(req, res, next) {
    try {
      const { fullName, email, password, phone, address } = req.body;
      const existing = await UserModel.getUserByEmail(email);
      if (existing) {
        req.flash('error', 'Пользователь с таким email уже существует.');
        return res.render('auth/register', { title: 'Регистрация', old: req.body });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const userId = await UserModel.createUser({ fullName, email, passwordHash, phone, address });
      req.session.user = await UserModel.getUserById(userId);

      await syncSessionCartToDb(userId, req.session.cart || []);
      req.session.cart = [];

      req.flash('success', 'Регистрация выполнена успешно.');
      res.redirect('/profile');
    } catch (error) {
      next(error);
    }
  }

  static renderLoginPage(req, res) {
    res.render('auth/login', { title: 'Вход', old: {} });
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const user = await UserModel.getUserByEmail(email);

      if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        req.flash('error', 'Неверный email или пароль.');
        return res.render('auth/login', { title: 'Вход', old: { email } });
      }

      req.session.user = {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role
      };

      await syncSessionCartToDb(user.id, req.session.cart || []);
      req.session.cart = [];

      req.flash('success', 'Вы успешно вошли в аккаунт.');
      res.redirect(user.role === 'admin' ? '/admin' : '/profile');
    } catch (error) {
      next(error);
    }
  }

  static logout(req, res, next) {
    req.session.destroy((error) => {
      if (error) return next(error);
      res.clearCookie('flower_shop_sid');
      res.redirect('/');
    });
  }
}

module.exports = AuthController;
