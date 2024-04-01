import { Router } from "express";
import OrderController from "../../controllers/OrderController";
import verifyJWT from "../../middlewares/verifyJWT";

const OrdersRouter = Router();

OrdersRouter.use(verifyJWT);

OrdersRouter.route("/")
  .post(async (req, res) => {
    const ordersController = new OrderController(req, res);
    await ordersController.createOrder();
  })
  .get(async (req, res) => {
    const ordersController = new OrderController(req, res);
    await ordersController.getAllOrders();
  })
  .delete(async (req, res) => {
    const ordersController = new OrderController(req, res);
    await ordersController.deleteAllOrders();
  });

OrdersRouter.route("/:orderId")
  .get(async (req, res) => {
    console.log(req.params);
    const ordersController = new OrderController(req, res);
    await ordersController.getOrderById();
  })
  .put(async (req, res) => {
    const ordersController = new OrderController(req, res);
    await ordersController.updateOrderStatus();
  })
  .delete(async (req, res) => {
    const ordersController = new OrderController(req, res);
    await ordersController.deleteOrderById();
  });

OrdersRouter.route("/userOrders/:userId")
  .get(async (req,res) => {
    const ordersController = new OrderController(req,res);
    await ordersController.getOrderByUserId()
  })

export default OrdersRouter;
