const HttpError = require('../utils/httpError');

const DUPLICATE_FIELD_LABELS = {
  categories: {
    name: 'Категория с таким названием уже существует.',
    slug: 'Категория с таким slug уже существует.'
  },
  products: {
    slug: 'Товар с таким slug уже существует.'
  },
  promotions: {
    promo_code: 'Промокод уже существует.'
  },
  users: {
    email: 'Пользователь с таким email уже существует.'
  }
};

function mapMysqlError(err) {
  if (err.code === 'ER_DUP_ENTRY') {
    const match = err.sqlMessage?.match(/for key '([^']+)'/i);
    const key = match?.[1] || '';

    for (const [table, labels] of Object.entries(DUPLICATE_FIELD_LABELS)) {
      for (const [field, message] of Object.entries(labels)) {
        if (key.includes(table) && key.includes(field)) {
          return new HttpError(message, 400);
        }
      }
    }

    return new HttpError('Запись с такими данными уже существует.', 400);
  }

  if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_NO_REFERENCED_ROW_2') {
    return new HttpError('Операция не может быть выполнена из-за связанных данных в базе.', 400);
  }

  return err;
}

module.exports = (err, req, res, next) => {
  const normalizedError = mapMysqlError(err);
  const statusCode = normalizedError.statusCode || 500;
  const safeMessage = statusCode >= 500
    ? 'На сервере произошла ошибка. Попробуйте ещё раз позже.'
    : normalizedError.message || 'Не удалось выполнить операцию.';

  console.error(normalizedError);

  if (req.accepts('html')) {
    return res.status(statusCode).render('error', {
      title: 'Ошибка',
      statusCode,
      message: safeMessage
    });
  }

  return res.status(statusCode).json({
    message: safeMessage,
    details: statusCode < 500 ? normalizedError.details || null : null
  });
};
