const UserModel = require('../models/userModel');
const OrderModel = require('../models/orderModel');

class ProfileController {
  static async renderProfilePage(req, res, next) {
    try {
      const [user, orders] = await Promise.all([
        UserModel.getUserById(req.session.user.id),
        OrderModel.getOrdersByUserId(req.session.user.id)
      ]);

      const totalOrders = orders.length;
      const totalSpent = orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
      const lastOrder = orders[0] || null;

      res.render('profile/index', {
        title: 'Профиль',
        user,
        stats: {
          totalOrders,
          totalSpent,
          lastOrder
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async renderEditProfilePage(req, res, next) {
    try {
      const user = await UserModel.getUserById(req.session.user.id);
      res.render('profile/edit', { title: 'Редактирование профиля', user });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      await UserModel.updateUser(req.session.user.id, {
        fullName: req.body.fullName,
        phone: req.body.phone,
        address: req.body.address
      });

      req.session.user = await UserModel.getUserById(req.session.user.id);
      req.flash('success', 'Профиль обновлён.');
      res.redirect('/profile');
    } catch (error) {
      next(error);
    }
  }

  static async renderOrdersHistoryPage(req, res, next) {
    try {
      const orders = await OrderModel.getOrdersByUserId(req.session.user.id);
      res.render('profile/orders', { title: 'История заказов', orders });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProfileController;
