import { Request, Response } from "express";
import {
  INewProductInfoObj,
} from "../Interfaces/IModels";
import trycatchHelper from "../utils/tryCatchHelper";
import ProductModel, {
  ProductRecordWithoutId,
  TProductInclude,
} from "../models/Products";
import ResponseHandler from "../utils/modelResponseHandler";
import logger from "../utils/logger";
import { Product, ProductAsset, Resturants } from "@prisma/client";
import { checkErrProperties } from "../helpers/customError";

/**
 * Product Controller:
 */
type TUpdateDto = {
  lowLevelAlert: number;
  productName: string;
  productDescription: string;
  inventory: {
    quantity: string;
  };
  productLabel: string;
};

class ProductController {
  // Product Model
  private model = ProductModel;
  constructor(private req: Request, private res: Response) {
    this.req = req;
    this.res = res;
  }

  public async createProduct() {
    logger("products").info("Creating product");
    let productInfoObj: INewProductInfoObj = this.req.body;

    const { data: newProduct, error: postErr } = await trycatchHelper<Product>(
      () => this.model.createProduct(productInfoObj)
    );
    if (postErr)
      return this.res.status(500).json({ err: "Error while creating product" });

    new ResponseHandler<Product | null>(this.res, newProduct).postResponse();
  }

  public async createManyProducts(){
    logger("products").info("Creating many products");

    let productInfoObjs:INewProductInfoObj[] = this.req.body;

    const { data:newProducts, error:postErr } = await trycatchHelper<Product[]>(
      () => this.model.createManyProducts(productInfoObjs)
    )

    if(postErr) return checkErrProperties(this.res, postErr);

    new ResponseHandler<Product[] | null>(this.res, newProducts).postResponse();
  }

  public async getProducts() {
    const { data: products, error: fetchErr } = await trycatchHelper<
      Product[]
    >(() => this.model.getAllProducts());
    if (fetchErr)
      return this.res
        .status(500)
        .json({ err: " An error occured while fetching products" });

    new ResponseHandler<Product[] | null>(this.res, products).getResponse();
  }

  public async getProduct() {
    const { productId } = this.req.params;
    const { data: product, error: fetchErr } = await trycatchHelper<Product>(
      () => this.model.getProduct(productId)
    );
    if (fetchErr)
      return this.res
        .status(500)
        .json({ err: " An error occured while fetching product" });

    new ResponseHandler<Product | null>(this.res, product).getResponse();
  }

  public async getProductsByType() {
    const {type} = this.req.params;
    const {data: products, error:fetchErr} = await trycatchHelper<Product[]>(
      () =>  this.model.getProductByRestuarantType(type as Resturants)
    )
    if(fetchErr) return checkErrProperties(this.res,fetchErr);
    new ResponseHandler<Product[] | null>(this.res,products).getResponse();
  }

  public async updateProduct() {
    const { productId } = this.req.params;
    let productDto: Partial<TUpdateDto> = this.req.body;
    const { data: productInfo, error: fetchErr } =
      await trycatchHelper<TProductInclude>(() =>
        this.model.getProduct(productId)
      );
    if (fetchErr) return checkErrProperties(this.res, fetchErr);

    if (productInfo) {
      if ("inventory" in productDto) {
        logger("inventory").info("Updating inventory");
        const { data: updateQtyInfo, error: updateErr } =
          await trycatchHelper<TProductInclude>(() =>
            this.model.updateProductQty({
              productId: productId,
              inventoryId: productInfo.inventoryId,
              qty: parseInt(productDto.inventory!.quantity),
            })
          );
        if (updateErr) return checkErrProperties(this.res, updateErr);
        productDto = {
          productDescription: productDto.productDescription,
          productName: productDto.productName,
          productLabel: productDto.productLabel,
        };
      }

      logger("product").info("Updating product");
      const { data: updatedProduct, error: updateErr } =
        await trycatchHelper<Product>(() =>
          this.model.updateProductInfo(productId, { ...productDto })
        );
      if (updateErr)
        return this.res
          .status(500)
          .json({ err: "An error occured while updating product" });
      console.log(updatedProduct);

      new ResponseHandler<Product | null>(
        this.res,
        updatedProduct
      ).updateResponse();
    } else {
      this.res.status(400).json({ err: "Product does not exist" });
    }
  }

  public async deleteProduct() {
    const { productId } = this.req.params;
    const { data: deletedProduct, error: deleteErr } =
      await trycatchHelper<Product>(() => this.model.deleteProduct(productId));
    if (deleteErr)
      return this.res
        .status(500)
        .json({ err: "An error occured while deleting product" });

    new ResponseHandler<Product | null>(
      this.res,
      deletedProduct
    ).deleteResponse();
  }

  public async deleteAllProducts() {
    const { data: deletedProducts, error: deleteErr } = await trycatchHelper<
      Product[]
    >(() => this.model.deleteAllProduct());
    if (deleteErr)
      return this.res
        .status(500)
        .json({ err: "An error occured while deleting products" });

    new ResponseHandler<Product[] | null>(
      this.res,
      deletedProducts
    ).deleteResponse();
  }
}

export default ProductController;
