module.exports = (req, res) => {
  res.status(404).render('error', {
    title: 'Страница не найдена',
    statusCode: 404,
    message: 'Запрашиваемая страница не существует.'
  });
};
