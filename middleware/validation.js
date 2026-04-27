const { body, validationResult } = require('express-validator');
const { deleteUploadIfExists } = require('../utils/fileCleanup');

const registerValidationRules = [
  body('fullName').trim().isLength({ min: 2, max: 120 }).withMessage('Укажите корректное имя.'),
  body('email').trim().isEmail().withMessage('Укажите корректный email.').normalizeEmail(),
  body('password').isLength({ min: 6, max: 64 }).withMessage('Пароль должен содержать от 6 до 64 символов.'),
  body('phone').optional({ checkFalsy: true }).trim().isLength({ min: 6, max: 30 }).withMessage('Укажите корректный телефон.'),
  body('address').optional({ checkFalsy: true }).trim().isLength({ max: 500 }).withMessage('Адрес слишком длинный.')
];

const loginValidationRules = [
  body('email').trim().isEmail().withMessage('Укажите корректный email.').normalizeEmail(),
  body('password').notEmpty().withMessage('Введите пароль.')
];

const cartAddValidationRules = [
  body('productId').isInt({ min: 1 }).withMessage('Некорректный товар.'),
  body('quantity').optional().isInt({ min: 1, max: 99 }).withMessage('Количество должно быть от 1 до 99.')
];

const cartUpdateValidationRules = [
  body('productId').isInt({ min: 1 }).withMessage('Некорректный товар.'),
  body('quantity').isInt({ min: 0, max: 99 }).withMessage('Количество должно быть от 0 до 99.')
];

const profileUpdateValidationRules = [
  body('fullName').trim().isLength({ min: 2, max: 120 }).withMessage('Укажите корректное имя.'),
  body('phone').optional({ checkFalsy: true }).trim().isLength({ min: 6, max: 30 }).withMessage('Укажите корректный телефон.'),
  body('address').optional({ checkFalsy: true }).trim().isLength({ max: 500 }).withMessage('Адрес слишком длинный.')
];

const checkoutValidationRules = [
  body('customerName').trim().isLength({ min: 2, max: 120 }).withMessage('Укажите имя получателя.'),
  body('customerEmail').trim().isEmail().withMessage('Укажите корректный email.').normalizeEmail(),
  body('customerPhone').trim().isLength({ min: 6, max: 30 }).withMessage('Укажите корректный телефон.'),
  body('deliveryAddress').trim().isLength({ min: 10, max: 500 }).withMessage('Укажите полный адрес доставки.'),
  body('paymentMethod').isIn(['cash', 'card']).withMessage('Некорректный способ оплаты.'),
  body('promoCode').optional({ checkFalsy: true }).trim().isLength({ max: 50 }).withMessage('Промокод слишком длинный.'),
  body('notes').optional({ checkFalsy: true }).trim().isLength({ max: 1000 }).withMessage('Комментарий слишком длинный.')
];

const categoryValidationRules = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Укажите название категории.'),
  body('slug').trim().matches(/^[a-z0-9-]+$/).withMessage('Slug должен содержать только строчные буквы, цифры и дефис.')
];

const productValidationRules = [
  body('categoryId').isInt({ min: 1 }).withMessage('Выберите категорию.'),
  body('name').trim().isLength({ min: 2, max: 150 }).withMessage('Укажите название товара.'),
  body('slug').trim().matches(/^[a-z0-9-]+$/).withMessage('Slug должен содержать только строчные буквы, цифры и дефис.'),
  body('price').isFloat({ min: 0.01 }).withMessage('Укажите корректную цену.'),
  body('description').trim().isLength({ min: 10, max: 5000 }).withMessage('Укажите описание от 10 символов.'),
  body('stock').isInt({ min: 0 }).withMessage('Остаток не может быть отрицательным.'),
  body('isActive').optional().isIn(['0', '1']).withMessage('Некорректный статус.')
];

const promotionValidationRules = [
  body('title').trim().isLength({ min: 2, max: 150 }).withMessage('Укажите название акции.'),
  body('description').trim().isLength({ min: 10, max: 2000 }).withMessage('Укажите описание акции.'),
  body('promoCode').optional({ checkFalsy: true }).trim().isLength({ max: 50 }).withMessage('Промокод слишком длинный.'),
  body('discountType').isIn(['percent', 'fixed']).withMessage('Некорректный тип скидки.'),
  body('discountValue')
    .isFloat({ min: 0.01 }).withMessage('Укажите корректное значение скидки.')
    .custom((value, { req }) => {
      const numericValue = Number(value);
      if (req.body.discountType === 'percent' && numericValue > 100) {
        throw new Error('Процент скидки не может быть больше 100.');
      }
      if (req.body.discountType === 'fixed' && numericValue > 1000000) {
        throw new Error('Фиксированная скидка слишком велика.');
      }
      return true;
    }),
  body('productId').optional({ checkFalsy: true }).isInt({ min: 1 }).withMessage('Некорректный товар.'),
  body('startsAt').notEmpty().withMessage('Укажите дату начала.').isISO8601().withMessage('Некорректная дата начала.'),
  body('endsAt')
    .notEmpty().withMessage('Укажите дату окончания.')
    .isISO8601().withMessage('Некорректная дата окончания.')
    .custom((value, { req }) => {
      const startsAt = new Date(req.body.startsAt);
      const endsAt = new Date(value);
      if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
        throw new Error('Укажите корректные даты акции.');
      }
      if (endsAt <= startsAt) {
        throw new Error('Дата окончания акции должна быть позже даты начала.');
      }
      return true;
    }),
  body('isActive').optional().isIn(['0', '1']).withMessage('Некорректный статус.')
];

const orderStatusValidationRules = [
  body('status').isIn(['new', 'processing', 'paid', 'delivered', 'cancelled']).withMessage('Некорректный статус заказа.')
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  if (req.file?.filename) {
    deleteUploadIfExists(`/uploads/${req.file.filename}`);
  }

  req.flash('error', errors.array().map((item) => item.msg));
  return res.redirect('back');
};

module.exports = {
  registerValidationRules,
  loginValidationRules,
  cartAddValidationRules,
  cartUpdateValidationRules,
  profileUpdateValidationRules,
  checkoutValidationRules,
  categoryValidationRules,
  productValidationRules,
  promotionValidationRules,
  orderStatusValidationRules,
  handleValidationErrors
};
