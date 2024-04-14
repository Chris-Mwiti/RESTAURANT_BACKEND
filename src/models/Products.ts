import { Prisma, Product } from "@prisma/client";
import prismaClient from "../config/prismaConfig";
import prismaErrHandler, {
  PrismaErrorTypes,
} from "../helpers/prismaErrHandler";
import trycatchHelper from "../utils/tryCatchHelper";
import { INewProductInfoObj } from "../Interfaces/IModels";
import DatabaseError from "../helpers/databaseError";
import { ObjectId } from "bson";
import logger from "../utils/logger";

export type ProductRecord = Pick<
  Product,
  | "id"
  | "productName"
  | "productDescription"
  | "sellingPrice"
  | "categoryId"
  | "inventoryId"
>;
export type ProductRecordWithoutId = Pick<
  ProductRecord,
  "productName" | "productDescription" | "sellingPrice" 
>;

// @TODO: Check various examples on mapped object type
//@TODO: Redefine the join properties structure to be strongly typed
// Inner join properties


interface IProductUpdateObj {
  id: string;
  updateInfo: Partial<ProductRecordWithoutId>;
}

interface IProductUpdateQtyObj {
  productId: string;
  inventoryId: string;
  qty: number;
}

//Include Type
const productInclude = Prisma.validator<Prisma.ProductDefaultArgs>()({
  include: {
    asset: true,
    category: true,
    inventory: true,
  },
});
const producIncludeProp: Prisma.ProductInclude =
  Prisma.validator<Prisma.ProductInclude>()({
    asset: true,
    category: true,
    inventory: true,
  });

export type TProductInclude = Prisma.ProductGetPayload<typeof productInclude>;

/**
 * Performs CRUD operations on the Product model
 */

class ProductModel {
  private static model = prismaClient.product;

  public static async createProduct(productInfoObj: INewProductInfoObj) {
    // Creates a new product with its relational subset fields if none of them exists
    const { data: productInfo, error: postErr } =
      await trycatchHelper<Product>(() =>
        this.model.create({
          data: {
            //Product Details
            id: new ObjectId().toHexString(),
            productName: productInfoObj.productName,
            productDescription: productInfoObj.productDescription,
            sellingPrice: parseInt(productInfoObj.sellingPrice),
            //Product Properties
            category: {
              connectOrCreate: {
                where: {
                  categoryName: productInfoObj.categoryName
                },
                create: {
                  id: new ObjectId().toHexString(),
                  categoryName: productInfoObj.categoryName ?? "",
                  categoryDescription: productInfoObj.categoryDescription ?? "",
                },
              },
            },
            inventory: {
              create: {
                id: new ObjectId().toHexString(),
                productName: productInfoObj.productName,
                quantity: parseInt(productInfoObj.inventory.quantity) ?? 0,
                lastRefilDate: new Date(),
              },
            },
            typeOfResturant: productInfoObj.type,
            asset: {
              create: {
                id: new ObjectId().toHexString(),
                images: productInfoObj.imageUrl,
              },
            },
          },
        })
      );
    if (postErr)
      return new DatabaseError({
        message: [
          "An error has occured while creating the product",
          postErr as PrismaErrorTypes,
        ],
        code: "500",
      });

    return productInfo;
  }

  public static async createManyProducts(products:INewProductInfoObj[]){
    const createPromises = products.map(async productInfoObj => {
      const { data: createInfo, error: createErr } =
        await trycatchHelper<Product>(() =>
          this.model.create({
            data: {
              id: new ObjectId().toHexString(),
              productName: productInfoObj.productName,
              productDescription: productInfoObj.productDescription,
              sellingPrice: parseInt(productInfoObj.sellingPrice),
              //Product Properties
              category: {
                connectOrCreate: {
                  where: {
                    categoryName: productInfoObj.categoryName,
                  },
                  create: {
                    id: new ObjectId().toHexString(),
                    categoryName: productInfoObj.categoryName ?? "",
                    categoryDescription:
                      productInfoObj.categoryDescription ?? "",
                  },
                },
              },
              inventory: {
                create: {
                  id: new ObjectId().toHexString(),
                  productName: productInfoObj.productName,
                  quantity: parseInt(productInfoObj.inventory.quantity) ?? 0,
                  lastRefilDate: new Date(),
                },
              },
              typeOfResturant: productInfoObj.type,
              asset: {
                create: {
                  id: new ObjectId().toHexString(),
                  images: productInfoObj.imageUrl,
                },
              },
            },
          })
        );
      //Error handling
      if(createErr) throw new DatabaseError({
        message: ["Error while creating products", createErr as PrismaErrorTypes],
        code: "500"
      })

      return createInfo
    })

      return await Promise.all(createPromises);
  }

  public static async getAllProducts(joinProperties?: TProductInclude) {
    const { data: productInfos, error: fetchError } = await trycatchHelper<
      Product[]
    >(() =>
      this.model.findMany({
        include: producIncludeProp,
      })
    );
    if (fetchError) prismaErrHandler(fetchError as PrismaErrorTypes);
    return productInfos;
  }

  public static async getProduct(id: string, properties?: TProductInclude) {
    const { data: productInfo, error: fetchError } =
      await trycatchHelper<Product>(() =>
        this.model.findUnique({
          where: {
            id: id,
          },
          include: producIncludeProp,
        })
      );

    if (fetchError) prismaErrHandler(fetchError as PrismaErrorTypes);

    return productInfo;
  }

  public static async getProductByRestuarantType(type: Product["typeOfResturant"]){
    logger("restuarant/product").info("Fetching restuarant products")
    const {data: productInfos, error:fetchErr } = await trycatchHelper<Product[]>(
        () => this.model.findMany({
            where: {
                typeOfResturant: type
            },
            include: producIncludeProp
        })
    )
    if(fetchErr) throw new DatabaseError({
        message: ["Error while fetching product infos", fetchErr as PrismaErrorTypes],
        code: "500"
    })

    return productInfos
  }

  public static async getProductQuantity(id: string) {
    const { data: productQty, error: fetchError } =
      await trycatchHelper<number>(() =>
        this.model.findUnique({
          where: {
            id: id,
          },
          include: {
            inventory: {
              select: {
                quantity: true,
              },
            },
          },
        })
      );
    if (fetchError) prismaErrHandler(fetchError as PrismaErrorTypes);

    return productQty;
  }

  public static async updateProductInfo(
    id: string,
    productInfo: Partial<ProductRecordWithoutId>,
    properties?: TProductInclude
  ) {
    const { data: updatedProductInfo, error: updateError } =
      await trycatchHelper<Product>(() =>
        this.model.update({
          where: {
            id: id,
          },
          data: productInfo,
          include: producIncludeProp,
        })
      );
    if (updateError) prismaErrHandler(updateError as PrismaErrorTypes);

    return updatedProductInfo;
  }

  public static async updateProductQty(
    productUpdateInfo: IProductUpdateQtyObj
  ) {
    //Updates the selected quantity of the selected product
    const { data: updatedProductQty, error: updateError } =
      await trycatchHelper<Product>(() =>
        this.model.update({
          where: {
            id: productUpdateInfo.productId,
          },
          data: {
            inventory: {
              update: {
                where: {
                  id: productUpdateInfo.inventoryId,
                },
                data: {
                  quantity: productUpdateInfo.qty,
                },
              },
            },
          },
          include: {
            inventory: {
              select: {
                quantity: true,
              },
            },
          },
        })
      );

    if (updateError) prismaErrHandler(updateError as PrismaErrorTypes);

    return updatedProductQty;
  }


  public static async deleteProduct(id: string) {
    const { data: deletedInfo, error: deleteErr } =
      await trycatchHelper<Product>(() =>
        this.model.delete({
          where: {
            id: id,
          },
        })
      );
    if (deleteErr) prismaErrHandler(deleteErr as PrismaErrorTypes);

    return deletedInfo;
  }

  public static async deleteProducts(productIds: string[]) {
    const deletedProductsPromises = productIds.map(async (productId) => {
      const { data: deletedInfos, error: deleteErr } = await trycatchHelper<
        Product[]
      >(() =>
        this.model.delete({
          where: {
            id: productId,
          },
        })
      );
      if (deleteErr) prismaErrHandler(deleteErr as PrismaErrorTypes);

      return deletedInfos;
    });

    const deletedProducts = await Promise.all(deletedProductsPromises);

    return deletedProducts;
  }

  public static async deleteAllProduct() {
    const { data: deletedInfos, error: deleteErr } = await trycatchHelper<
      Product[]
    >(() => this.model.deleteMany());
    if (deleteErr) prismaErrHandler(deleteErr as PrismaErrorTypes);

    return deletedInfos;
  }
}

export default ProductModel;
