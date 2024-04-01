import { Request, Response } from "express";
import { TOrderDto, TOrderIncludeDto } from "../models/Order";
import trycatchHelper from "../utils/tryCatchHelper";
import {
  Inventory,
  OrderDetails,
  OrderItems,
  OrderStatus,
  Product,
} from "@prisma/client";
import OrderItemsModel from "../models/OrderItems";
import { checkErrProperties } from "../helpers/customError";
import ResponseHandler from "../utils/modelResponseHandler";
import logger from "../utils/logger";
import Orders from "../models/Order";
import { getUserId } from "../middlewares/verifyJWT";

type TUpdateBodyDto = {
  status: OrderStatus;
};

class OrderController {
  private model = Orders;
  private itemsModel = OrderItemsModel;

  constructor(private req: Request, private res: Response) {}

  public async createOrder() {
    logger("orders").info("Creating new order");
    let orderDto: TOrderDto = this.req.body;
    const userId = getUserId(this.req, this.res);

    orderDto.userId = getUserId(this.req, this.res);
    // //Create the order itself
    const { data: orderInfo, error: createOrderErr } =
      await trycatchHelper<OrderDetails>(() =>
        this.model.createOrder(orderDto)
      );

    if (createOrderErr) return checkErrProperties(this.res, createOrderErr);
    if (orderInfo) {
      //Create the order items first
      const { data: orderItems, error: createErr } = await trycatchHelper<
        OrderItems[]
      >(() => this.itemsModel.createOrderItem(orderDto.items, orderInfo.id));
      if (createErr) return checkErrProperties(this.res, createErr);
      if (!orderItems)
        return this.res.status(500).json({ err: "Internal server error" });

      new ResponseHandler<OrderItems[] | null>(
        this.res,
        orderItems
      ).postResponse();
    } else {
      this.res.status(500).json({ err: "Error while creating order" });
    }
  }

  public async getAllOrders() {
    logger("orders").info("Fetching orders");
    const { data: ordersInfo, error: fetchErr } = await trycatchHelper<
      OrderDetails[]
    >(() => this.model.getAllOrders());

    if (fetchErr) return checkErrProperties(this.res, fetchErr);

    new ResponseHandler<OrderDetails[] | null>(
      this.res,
      ordersInfo
    ).getResponse();
  }

  public async getOrderById() {
    logger("orders").info("Fetching order");
    const { orderId } = this.req.params;
    const { data: orderInfo, error: fetchErr } =
      await trycatchHelper<OrderDetails>(() =>
        this.model.getOrderById(orderId)
      );
    if (fetchErr) return checkErrProperties(this.res, fetchErr);

    new ResponseHandler<OrderDetails | null>(this.res, orderInfo).getResponse();
  }

  public async getOrderByUserId() {
    logger("orders").info("Fetching order");
    const { userId } = this.req.params;
    const { data: orderInfo, error: fetchErr } =
      await trycatchHelper<OrderDetails>(() =>
        this.model.getOrderByUserId(userId)
      );
    if (fetchErr) return checkErrProperties(this.res, fetchErr);

    new ResponseHandler<OrderDetails | null>(this.res, orderInfo).getResponse();
  }

  public async updateOrderStatus() {
    logger("orders").info("Updating order");
    const { orderId } = this.req.params;
    const updateDto: TUpdateBodyDto = this.req.body;

    const { data: updatedInfo, error: updateErr } =
      await trycatchHelper<TOrderIncludeDto>(() =>
        this.model.updateOrderStatus(orderId, updateDto.status)
      );

    if (updateErr) return checkErrProperties(this.res, updateErr);

    //Creates a new notification and creates a q  retailer product
    new ResponseHandler<OrderDetails | null>(
      this.res,
      updatedInfo
    ).updateResponse();
  }

  public async deleteAllOrders() {
    logger("orders").info("Deleting order");
    const { data: deletedInfos, error: deleteErr } = await trycatchHelper<
      OrderDetails[]
    >(() => this.model.deleteAllOrders());

    if (deleteErr) return checkErrProperties(this.res, deleteErr);

    new ResponseHandler<OrderDetails[] | null>(
      this.res,
      deletedInfos
    ).deleteResponse();
  }

  public async deleteOrderById() {
    logger("orders").info("Deleting order");
    const { orderId } = this.req.params;

    const { data: deletedInfo, error: deleteErr } =
      await trycatchHelper<OrderDetails>(() =>
        this.model.deleteOrderById(orderId)
      );

    if (deleteErr) return checkErrProperties(this.res, deleteErr);

    new ResponseHandler<OrderDetails | null>(
      this.res,
      deletedInfo
    ).deleteResponse();
  }
}

export default OrderController;
