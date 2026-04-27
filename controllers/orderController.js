const https = require('https');
const CartModel = require('../models/cartModel');
const OrderModel = require('../models/orderModel');
const PromotionModel = require('../models/promotionModel');
const UserModel = require('../models/userModel');

function fetchAddressSuggestions(query) {
  return new Promise((resolve, reject) => {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=ru&addressdetails=1&limit=6&q=${encodedQuery}`;

    const request = https.get(
      url,
      {
        headers: {
          'User-Agent': 'flower-shop-address-suggest/1.0 (local-dev)'
        }
      },
      (response) => {
        if (response.statusCode !== 200) {
          response.resume();
          return reject(new Error(`Address provider responded with status ${response.statusCode}`));
        }

        let body = '';
        response.setEncoding('utf8');
        response.on('data', (chunk) => {
          body += chunk;
        });

        response.on('end', () => {
          try {
            const payload = JSON.parse(body);
            const suggestions = Array.isArray(payload)
              ? payload
                .map((item) => (item?.display_name || '').trim())
                .filter(Boolean)
              : [];
            resolve(suggestions);
          } catch (error) {
            reject(error);
          }
        });
      }
    );

    request.on('error', reject);
    request.setTimeout(5000, () => {
      request.destroy(new Error('Address provider timeout'));
    });
  });
}

class OrderController {
  static async renderCheckoutPage(req, res, next) {
    try {
      const [user, cart] = await Promise.all([
        UserModel.getUserById(req.session.user.id),
        CartModel.getDbCartByUserId(req.session.user.id)
      ]);

      if (!cart.items.length) {
        req.flash('error', 'Корзина пуста.');
        return res.redirect('/cart');
      }

      res.render('orders/checkout', {
        title: 'Оформление заказа',
        user,
        cart
      });
    } catch (error) {
      next(error);
    }
  }

  static async createOrder(req, res, next) {
    try {
      const userId = req.session.user.id;
      const cart = await CartModel.getDbCartByUserId(userId);

      if (!cart.items.length) {
        req.flash('error', 'Корзина пуста.');
        return res.redirect('/cart');
      }

      let promotion = null;
      let discountAmount = 0;
      if (req.body.promoCode) {
        promotion = await PromotionModel.getActivePromotionByCode(req.body.promoCode.trim());
        if (promotion) {
          discountAmount = PromotionModel.calculateDiscount(cart.items, promotion);
        }
      }

      const orderId = await OrderModel.createOrder({
        userId,
        cartItems: cart.items,
        customerName: req.body.customerName,
        customerEmail: req.body.customerEmail,
        customerPhone: req.body.customerPhone,
        deliveryAddress: req.body.deliveryAddress,
        paymentMethod: req.body.paymentMethod,
        notes: req.body.notes,
        promotion,
        subtotal: cart.subtotal,
        discountAmount
      });

      await CartModel.clearDbCart(userId);
      req.flash('success', 'Заказ успешно оформлен.');
      res.redirect(`/orders/success/${orderId}`);
    } catch (error) {
      next(error);
    }
  }

  static async renderSuccessPage(req, res, next) {
    try {
      const order = await OrderModel.getOrderByIdAndUserId(req.params.id, req.session.user.id);
      if (!order) {
        const err = new Error('Заказ не найден.');
        err.statusCode = 404;
        throw err;
      }

      res.render('orders/success', {
        title: 'Заказ оформлен',
        order
      });
    } catch (error) {
      next(error);
    }
  }

  static async suggestAddress(req, res) {
    try {
      const query = (req.query.q || '').trim();
      if (query.length < 3) {
        return res.json({ suggestions: [] });
      }

      const suggestions = await fetchAddressSuggestions(query);
      return res.json({ suggestions: suggestions.slice(0, 6) });
    } catch (error) {
      console.error('Address suggestion error:', error.message);
      return res.status(502).json({ suggestions: [] });
    }
  }
}

module.exports = OrderController;
