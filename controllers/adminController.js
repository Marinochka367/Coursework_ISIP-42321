const ProductModel = require('../models/productModel');
const PromotionModel = require('../models/promotionModel');
const OrderModel = require('../models/orderModel');
const UserModel = require('../models/userModel');
const HttpError = require('../utils/httpError');
const { deleteUploadIfExists } = require('../utils/fileCleanup');
const { normalizePage, buildPagination } = require('../utils/pagination');

const ADMIN_PAGE_SIZE = 10;

class AdminController {
  static async renderDashboard(req, res, next) {
    try {
      const [products, categories, promotions, stats, totalUsers] = await Promise.all([
        ProductModel.getAllProductsForAdmin({ page: 1, limit: 5 }),
        ProductModel.getAllCategories({ page: 1, limit: 5 }),
        PromotionModel.getAllPromotionsForAdmin({ page: 1, limit: 5 }),
        OrderModel.getAdminStats(),
        UserModel.getUserCounts()
      ]);

      res.render('admin/dashboard', {
        title: 'Админ-панель',
        products,
        categories,
        promotions,
        stats,
        totalUsers
      });
    } catch (error) {
      next(error);
    }
  }

  static async renderCategoriesPage(req, res, next) {
    try {
      const search = (req.query.search || '').trim();
      const page = normalizePage(req.query.page);
      const totalItems = await ProductModel.countCategories({ search });
      const pagination = buildPagination(totalItems, page, ADMIN_PAGE_SIZE);
      const categories = await ProductModel.getAllCategories({
        search,
        page: pagination.currentPage,
        limit: pagination.perPage
      });

      res.render('admin/categories', {
        title: 'Управление категориями',
        categories,
        editItem: null,
        filters: { search },
        pagination
      });
    } catch (error) {
      next(error);
    }
  }

  static async renderEditCategoryPage(req, res, next) {
    try {
      const search = (req.query.search || '').trim();
      const page = normalizePage(req.query.page);
      const totalItems = await ProductModel.countCategories({ search });
      const pagination = buildPagination(totalItems, page, ADMIN_PAGE_SIZE);
      const [categories, editItem] = await Promise.all([
        ProductModel.getAllCategories({ search, page: pagination.currentPage, limit: pagination.perPage }),
        ProductModel.getCategoryById(req.params.id)
      ]);
      if (!editItem) {
        req.flash('error', 'Категория не найдена.');
        return res.redirect('/admin/categories');
      }

      res.render('admin/categories', {
        title: 'Редактирование категории',
        categories,
        editItem,
        filters: { search },
        pagination
      });
    } catch (error) {
      next(error);
    }
  }

  static async createCategory(req, res, next) {
    try {
      const existingSlug = await ProductModel.getCategoryBySlug(req.body.slug);
      if (existingSlug) {
        throw new HttpError('Категория с таким slug уже существует.', 400);
      }

      await ProductModel.createCategory({ name: req.body.name, slug: req.body.slug });
      req.flash('success', 'Категория создана.');
      res.redirect('/admin/categories');
    } catch (error) {
      next(error);
    }
  }

  static async updateCategory(req, res, next) {
    try {
      const existingSlug = await ProductModel.getCategoryBySlug(req.body.slug);
      if (existingSlug && Number(existingSlug.id) !== Number(req.params.id)) {
        throw new HttpError('Категория с таким slug уже существует.', 400);
      }

      await ProductModel.updateCategory(req.params.id, { name: req.body.name, slug: req.body.slug });
      req.flash('success', 'Категория обновлена.');
      res.redirect('/admin/categories');
    } catch (error) {
      next(error);
    }
  }

  static async deleteCategory(req, res, next) {
    try {
      await ProductModel.deleteCategory(req.params.id);
      req.flash('success', 'Категория удалена.');
      res.redirect('/admin/categories');
    } catch (error) {
      next(error);
    }
  }

  static async renderProductsPage(req, res, next) {
    try {
      const search = (req.query.search || '').trim();
      const page = normalizePage(req.query.page);
      const totalItems = await ProductModel.countProducts({ search, adminOnly: true });
      const pagination = buildPagination(totalItems, page, ADMIN_PAGE_SIZE);
      const [products, categories] = await Promise.all([
        ProductModel.getAllProductsForAdmin({ search, page: pagination.currentPage, limit: pagination.perPage }),
        ProductModel.getAllCategories()
      ]);

      res.render('admin/products', {
        title: 'Управление товарами',
        products,
        categories,
        editItem: null,
        filters: { search },
        pagination
      });
    } catch (error) {
      next(error);
    }
  }

  static async renderEditProductPage(req, res, next) {
    try {
      const search = (req.query.search || '').trim();
      const page = normalizePage(req.query.page);
      const totalItems = await ProductModel.countProducts({ search, adminOnly: true });
      const pagination = buildPagination(totalItems, page, ADMIN_PAGE_SIZE);
      const [products, categories, editItem] = await Promise.all([
        ProductModel.getAllProductsForAdmin({ search, page: pagination.currentPage, limit: pagination.perPage }),
        ProductModel.getAllCategories(),
        ProductModel.getProductById(req.params.id)
      ]);

      if (!editItem) {
        req.flash('error', 'Товар не найден.');
        return res.redirect('/admin/products');
      }

      res.render('admin/products', {
        title: 'Редактирование товара',
        products,
        categories,
        editItem,
        filters: { search },
        pagination
      });
    } catch (error) {
      next(error);
    }
  }

  static async createProduct(req, res, next) {
    try {
      if (!req.file) {
        req.flash('error', 'Загрузите изображение товара.');
        return res.redirect('/admin/products');
      }

      const existingSlug = await ProductModel.getProductBySlugForAdmin(req.body.slug);
      if (existingSlug) {
        deleteUploadIfExists(`/uploads/${req.file.filename}`);
        throw new HttpError('Товар с таким slug уже существует.', 400);
      }

      await ProductModel.createProduct({
        categoryId: Number(req.body.categoryId),
        name: req.body.name,
        slug: req.body.slug,
        price: Number(req.body.price),
        description: req.body.description,
        image: `/uploads/${req.file.filename}`,
        stock: Number(req.body.stock),
        isActive: req.body.isActive === '1' ? 1 : 0
      });

      req.flash('success', 'Товар создан.');
      res.redirect('/admin/products');
    } catch (error) {
      if (req.file) deleteUploadIfExists(`/uploads/${req.file.filename}`);
      next(error);
    }
  }

  static async updateProduct(req, res, next) {
    let newImagePath = null;

    try {
      const product = await ProductModel.getProductById(req.params.id);
      if (!product) {
        if (req.file) deleteUploadIfExists(`/uploads/${req.file.filename}`);
        req.flash('error', 'Товар не найден.');
        return res.redirect('/admin/products');
      }

      const existingSlug = await ProductModel.getProductBySlugForAdmin(req.body.slug);
      if (existingSlug && Number(existingSlug.id) !== Number(req.params.id)) {
        if (req.file) deleteUploadIfExists(`/uploads/${req.file.filename}`);
        throw new HttpError('Товар с таким slug уже существует.', 400);
      }

      let image = product.image;
      if (req.file) {
        image = `/uploads/${req.file.filename}`;
        newImagePath = image;
      }

      await ProductModel.updateProduct(req.params.id, {
        categoryId: Number(req.body.categoryId),
        name: req.body.name,
        slug: req.body.slug,
        price: Number(req.body.price),
        description: req.body.description,
        image,
        stock: Number(req.body.stock),
        isActive: req.body.isActive === '1' ? 1 : 0
      });

      if (newImagePath) deleteUploadIfExists(product.image);

      req.flash('success', 'Товар обновлён.');
      res.redirect('/admin/products');
    } catch (error) {
      if (newImagePath) deleteUploadIfExists(newImagePath);
      next(error);
    }
  }

  static async deleteProduct(req, res, next) {
    try {
      const product = await ProductModel.getProductById(req.params.id);
      await ProductModel.deleteProduct(req.params.id);
      if (product) deleteUploadIfExists(product.image);

      req.flash('success', 'Товар удалён.');
      res.redirect('/admin/products');
    } catch (error) {
      next(error);
    }
  }

  static async renderPromotionsPage(req, res, next) {
    try {
      const search = (req.query.search || '').trim();
      const page = normalizePage(req.query.page);
      const totalItems = await PromotionModel.countPromotions({ search });
      const pagination = buildPagination(totalItems, page, ADMIN_PAGE_SIZE);
      const [promotions, products] = await Promise.all([
        PromotionModel.getAllPromotionsForAdmin({ search, page: pagination.currentPage, limit: pagination.perPage }),
        ProductModel.getAllProductsForAdmin({ page: 1, limit: 200 })
      ]);

      res.render('admin/promotions', {
        title: 'Управление акциями',
        promotions,
        products,
        editItem: null,
        filters: { search },
        pagination
      });
    } catch (error) {
      next(error);
    }
  }

  static async renderEditPromotionPage(req, res, next) {
    try {
      const search = (req.query.search || '').trim();
      const page = normalizePage(req.query.page);
      const totalItems = await PromotionModel.countPromotions({ search });
      const pagination = buildPagination(totalItems, page, ADMIN_PAGE_SIZE);
      const [promotions, products, editItem] = await Promise.all([
        PromotionModel.getAllPromotionsForAdmin({ search, page: pagination.currentPage, limit: pagination.perPage }),
        ProductModel.getAllProductsForAdmin({ page: 1, limit: 200 }),
        PromotionModel.getPromotionById(req.params.id)
      ]);

      if (!editItem) {
        req.flash('error', 'Акция не найдена.');
        return res.redirect('/admin/promotions');
      }

      res.render('admin/promotions', {
        title: 'Редактирование акции',
        promotions,
        products,
        editItem,
        filters: { search },
        pagination
      });
    } catch (error) {
      next(error);
    }
  }

  static async createPromotion(req, res, next) {
    try {
      const promoCode = req.body.promoCode?.trim();
      const existingCode = await PromotionModel.getPromotionByCodeForAdmin(promoCode);
      if (existingCode) {
        throw new HttpError('Промокод уже существует.', 400);
      }

      await PromotionModel.createPromotion({
        title: req.body.title,
        description: req.body.description,
        promoCode,
        discountType: req.body.discountType,
        discountValue: Number(req.body.discountValue),
        productId: req.body.productId || null,
        isActive: req.body.isActive === '1' ? 1 : 0,
        startsAt: req.body.startsAt.replace('T', ' '),
        endsAt: req.body.endsAt.replace('T', ' ')
      });
      req.flash('success', 'Акция создана.');
      res.redirect('/admin/promotions');
    } catch (error) {
      next(error);
    }
  }

  static async updatePromotion(req, res, next) {
    try {
      const promoCode = req.body.promoCode?.trim();
      const existingCode = await PromotionModel.getPromotionByCodeForAdmin(promoCode);
      if (existingCode && Number(existingCode.id) !== Number(req.params.id)) {
        throw new HttpError('Промокод уже существует.', 400);
      }

      await PromotionModel.updatePromotion(req.params.id, {
        title: req.body.title,
        description: req.body.description,
        promoCode,
        discountType: req.body.discountType,
        discountValue: Number(req.body.discountValue),
        productId: req.body.productId || null,
        isActive: req.body.isActive === '1' ? 1 : 0,
        startsAt: req.body.startsAt.replace('T', ' '),
        endsAt: req.body.endsAt.replace('T', ' ')
      });
      req.flash('success', 'Акция обновлена.');
      res.redirect('/admin/promotions');
    } catch (error) {
      next(error);
    }
  }

  static async deletePromotion(req, res, next) {
    try {
      await PromotionModel.deletePromotion(req.params.id);
      req.flash('success', 'Акция удалена.');
      res.redirect('/admin/promotions');
    } catch (error) {
      next(error);
    }
  }

  static async renderOrdersPage(req, res, next) {
    try {
      const search = (req.query.search || '').trim();
      const status = (req.query.status || '').trim();
      const page = normalizePage(req.query.page);
      const totalItems = await OrderModel.countOrdersForAdmin({ search, status });
      const pagination = buildPagination(totalItems, page, ADMIN_PAGE_SIZE);
      const orders = await OrderModel.getOrdersForAdmin({
        search,
        status,
        page: pagination.currentPage,
        limit: pagination.perPage
      });

      res.render('admin/orders', {
        title: 'Управление заказами',
        orders,
        activeOrder: null,
        filters: { search, status },
        pagination,
        statuses: ['new', 'processing', 'paid', 'delivered', 'cancelled']
      });
    } catch (error) {
      next(error);
    }
  }

  static async renderOrderDetailsPage(req, res, next) {
    try {
      const search = (req.query.search || '').trim();
      const status = (req.query.status || '').trim();
      const page = normalizePage(req.query.page);
      const totalItems = await OrderModel.countOrdersForAdmin({ search, status });
      const pagination = buildPagination(totalItems, page, ADMIN_PAGE_SIZE);
      const [orders, activeOrder] = await Promise.all([
        OrderModel.getOrdersForAdmin({ search, status, page: pagination.currentPage, limit: pagination.perPage }),
        OrderModel.getOrderByIdForAdmin(req.params.id)
      ]);

      if (!activeOrder) {
        req.flash('error', 'Заказ не найден.');
        return res.redirect('/admin/orders');
      }

      res.render('admin/orders', {
        title: `Заказ #${activeOrder.id}`,
        orders,
        activeOrder,
        filters: { search, status },
        pagination,
        statuses: ['new', 'processing', 'paid', 'delivered', 'cancelled']
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateOrderStatus(req, res, next) {
    try {
      const order = await OrderModel.getOrderByIdForAdmin(req.params.id);
      if (!order) {
        throw new HttpError('Заказ не найден.', 404);
      }

      await OrderModel.updateOrderStatus(req.params.id, req.body.status);
      req.flash('success', 'Статус заказа обновлён.');
      res.redirect(`/admin/orders/${req.params.id}`);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AdminController;
