module.exports = (req, res, next) => {
  if (!req.session.user) {
    req.flash('error', 'Необходимо войти в систему.');
    return res.redirect('/auth/login');
  }

  if (req.session.user.role !== 'admin') {
    req.flash('error', 'Доступ разрешён только администраторам.');
    return res.redirect('/');
  }

  next();
};
