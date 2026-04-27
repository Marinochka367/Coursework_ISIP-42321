const ProductModel = require('../models/productModel');
const { normalizePage, buildPagination } = require('../utils/pagination');

class ProductController {
  static normalizePrice(value) {
    if (value === undefined || value === null || value === '') return null;
    const numeric = Number(value);
    return Number.isFinite(numeric) && numeric >= 0 ? numeric : null;
  }

  static async renderHomePage(req, res, next) {
    try {
      const [featuredProducts, categories] = await Promise.all([
        ProductModel.getFeaturedProducts(),
        ProductModel.getAllCategories()
      ]);

      res.render('home', {
        title: 'Цветочный салон',
        featuredProducts,
        categories
      });
    } catch (error) {
      next(error);
    }
  }

  static async renderCatalogPage(req, res, next) {
    try {
      const category = (req.query.category || '').trim();
      const search = (req.query.search || '').trim();
      const minPrice = this.normalizePrice(req.query.minPrice);
      const maxPrice = this.normalizePrice(req.query.maxPrice);
      const sort = (req.query.sort || 'newest').trim();
      const page = normalizePage(req.query.page);
      const totalItems = await ProductModel.countProducts({
        categorySlug: category,
        search,
        minPrice,
        maxPrice
      });
      const pagination = buildPagination(totalItems, page, 9);
      const [products, categories] = await Promise.all([
        ProductModel.getAllProducts({
          categorySlug: category,
          search,
          minPrice,
          maxPrice,
          sort,
          page: pagination.currentPage,
          limit: pagination.perPage
        }),
        ProductModel.getAllCategories()
      ]);

      res.render('products/index', {
        title: 'Каталог',
        products,
        categories,
        activeCategory: category,
        search,
        filters: {
          minPrice: req.query.minPrice || '',
          maxPrice: req.query.maxPrice || '',
          sort
        },
        pagination
      });
    } catch (error) {
      next(error);
    }
  }

  static async renderProductDetailPage(req, res, next) {
    try {
      const product = await ProductModel.getProductBySlug(req.params.slug);
      if (!product) {
        const err = new Error('Товар не найден');
        err.statusCode = 404;
        throw err;
      }

      res.render('products/detail', {
        title: product.name,
        product
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProductController;
