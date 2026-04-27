function normalizePage(page, fallback = 1) {
  const value = Number.parseInt(page, 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function buildPagination(totalItems, currentPage = 1, perPage = 9) {
  const totalPages = Math.max(Math.ceil(Number(totalItems) / perPage), 1);
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);
  const offset = (safePage - 1) * perPage;

  return {
    currentPage: safePage,
    perPage,
    totalItems: Number(totalItems),
    totalPages,
    offset,
    hasPrev: safePage > 1,
    hasNext: safePage < totalPages,
    pages: Array.from({ length: totalPages }, (_, index) => index + 1)
  };
}

module.exports = {
  normalizePage,
  buildPagination
};
