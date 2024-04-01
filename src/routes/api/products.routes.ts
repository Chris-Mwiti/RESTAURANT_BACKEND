import { Router } from "express";
import ProductController from "../../controllers/ProductController";
import logger from "../../utils/logger";
import verifyJWT from "../../middlewares/verifyJWT";

/**
 * Product Router
 */

//Initialization of the product router
const ProductRouter = Router();

//Roles Middleware initialization

// ProductRouter.use(verifyJWT);

ProductRouter.route("/")
  .get(async (req, res) => {
    console.log("Hello");
    logger("products").info("Hello my products");
    const productController = new ProductController(req, res);
    await productController.getProducts();
  })
  .post(async (req, res) => {
    const productController = new ProductController(req, res);
    await productController.createProduct();
  })
  .delete(async (req, res) => {
    const productController = new ProductController(req, res);
    await productController.deleteAllProducts();
  });

//Routes that require a productId parameter
ProductRouter.route("/:productId")
  .get(async (req, res) => {
    const productController = new ProductController(req, res);
    await productController.getProduct();
  })
  .put(async (req, res) => {
    const productController = new ProductController(req, res);
    await productController.updateProduct();
  })
  .delete(async (req, res) => {
    const productController = new ProductController(req, res);
    await productController.deleteProduct();
  });

ProductRouter.route("/restuarant/:type").get(async (req, res) => {
  const productController = new ProductController(req, res);
  await productController.getProductsByType();
});

export default ProductRouter;
