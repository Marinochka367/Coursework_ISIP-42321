module.exports = (req, res, next) => {
  if (!req.session.user) {
    req.flash('error', 'Для доступа к этой странице необходимо войти в аккаунт.');
    return res.redirect('/auth/login');
  }
  next();
};
