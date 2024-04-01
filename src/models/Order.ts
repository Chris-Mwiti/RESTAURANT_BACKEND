import {
  OrderDetails,
  OrderItems,
  OrderStatus,
  PaymentProviders,
  Prisma,
  ShippingDetails,
} from "@prisma/client";
import prismaClient from "../config/prismaConfig";
import trycatchHelper from "../utils/tryCatchHelper";
import DatabaseError from "../helpers/databaseError";
import { PrismaErrorTypes } from "../helpers/prismaErrHandler";
import { ObjectId } from "bson";

export type TOrderDto = Omit<OrderDetails, "id"> & {
  total: string;
  items: OrderItems[];
  provider: PaymentProviders;
  shippingDto: Omit<ShippingDetails, "id" | "userId">;
  userId: string;
};

const orderInclude: Prisma.OrderDetailsInclude =
  Prisma.validator<Prisma.OrderDetailsInclude>()({
    user: {
      select: {
        id: true,
        avatarUrl: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
      },
    },
    payment: true,
    items: {
      include: {
        product: {
          select: {
            productName: true,
            sellingPrice: true,
            inventoryId: true,
            asset: true,
          },
        },
      },
    },
    shippingInfo: true,
  });

const OrdersIncludeDto = Prisma.validator<Prisma.OrderDetailsDefaultArgs>()({
  include: orderInclude,
});

export type TOrderIncludeDto = Prisma.OrderDetailsGetPayload<
  typeof OrdersIncludeDto
>;

class Orders {
  private static model = prismaClient.orderDetails;

  public static async createOrder(orderDto: TOrderDto) {
    const { data: orderInfo, error: createErr } =
      await trycatchHelper<OrderDetails>(() =>
        this.model.create<Prisma.OrderDetailsCreateArgs>({
          data: {
            id: new ObjectId().toHexString(),
            total: parseInt(orderDto.total),
            payment: {
              create: {
                id: new ObjectId().toHexString(),
                amount: parseInt(orderDto.total),
                user: {
                  connect: { id: orderDto.userId },
                },
                provider: orderDto.provider,
              },
            },
            shippingInfo: {
              create: {
                id: new ObjectId().toHexString(),
                county: "Nairobi",
                street: "Mombasa",
                town: "Juja",
                locationDesc: "Juja police station",
                user: {
                  connect: { id: orderDto.userId },
                },
              },
            },
            userId: orderDto.userId,
          },
        })
      );

    if (createErr)
      throw new DatabaseError({
        message: [
          "Error while creating new order",
          createErr as PrismaErrorTypes,
        ],
        code: "500",
      });

    return orderInfo;
  }

  public static async getAllOrders() {
    const { data: orderInfos, error: fetchError } = await trycatchHelper<
      TOrderIncludeDto[]
    >(() =>
      this.model.findMany({
        include: orderInclude,
      })
    );

    if (fetchError)
      throw new DatabaseError({
        message: [
          "Error while fetching orders",
          fetchError as PrismaErrorTypes,
        ],
        code: "500",
      });

    return orderInfos;
  }

  public static async getOrderById(orderId: string) {
    const { data: orderInfo, error: fetchErr } =
      await trycatchHelper<TOrderIncludeDto>(() =>
        this.model.findUnique({
          where: {
            id: orderId,
          },
          include: orderInclude,
        })
      );

    if (fetchErr)
      throw new DatabaseError({
        message: ["Error while fetching order", fetchErr as PrismaErrorTypes],
        code: "500",
      });

    return orderInfo;
  }

  public static async getOrderByUserId(userId: string) {
    const { data: orderInfo, error: fetchErr } =
      await trycatchHelper<TOrderIncludeDto>(() =>
        this.model.findMany({
          where: {
            userId: userId
          },
          include: orderInclude,
        })
      );

    if (fetchErr)
      throw new DatabaseError({
        message: ["Error while fetching order", fetchErr as PrismaErrorTypes],
        code: "500",
      });

    return orderInfo;
  }

  public static async updateOrderStatus(orderId: string, status: OrderStatus) {
    const { data: updatedInfo, error: updateErr } =
      await trycatchHelper<TOrderIncludeDto>(() =>
        this.model.update({
          where: {
            id: orderId,
          },
          data: {
            status: status,
          },
          include: orderInclude,
        })
      );

    if (updateErr)
      throw new DatabaseError({
        message: ["Error while updating order", updateErr as PrismaErrorTypes],
        code: "500",
      });

    return updatedInfo;
  }

  public static async deleteAllOrders() {
    const { data: deletedInfos, error: deleteErr } = await trycatchHelper<
      OrderDetails[]
    >(() => this.model.deleteMany());

    if (deleteErr)
      throw new DatabaseError({
        message: ["Error while deleting orders", deleteErr as PrismaErrorTypes],
        code: "500",
      });

    return deletedInfos;
  }

  public static async deleteOrderById(orderId: string) {
    const { data: deletedInfo, error: deleteErr } =
      await trycatchHelper<OrderDetails>(() =>
        this.model.delete({
          where: {
            id: orderId,
          },
        })
      );

    if (deleteErr)
      throw new DatabaseError({
        message: ["Error while deleting order", deleteErr as PrismaErrorTypes],
        code: "500",
      });

    return deletedInfo;
  }
}

export default Orders;
