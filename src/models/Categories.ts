import { Category } from "@prisma/client";
import prismaClient from "../config/prismaConfig";
import trycatchHelper from "../utils/tryCatchHelper";
import DatabaseError from "../helpers/databaseError";
import { PrismaErrorTypes } from "../helpers/prismaErrHandler";
import { ObjectId } from "bson";

class CategoryModel {
  private static model = prismaClient.category;

  public static async createCategory(categoryDto: Omit<Category, "id">) {
    const { data: createInfo, error: createErr } =
      await trycatchHelper<Category>(() =>
        this.model.create({
          data: {
            id: new ObjectId().toHexString(),
            ...categoryDto,
          },
        })
      );

    if (createErr)
      throw new DatabaseError({
        message: [
          "Error while creating product",
          createErr as PrismaErrorTypes,
        ],
        code: "500",
      });

    return createInfo;
  }

  public static async getAllCategories() {
    const { data: categoryInfos, error: fetchErr } = await trycatchHelper<
      Category[]
    >(() => this.model.findMany());

    if (fetchErr)
      throw new DatabaseError({
        message: [
          "Error while fetching categories",
          fetchErr as PrismaErrorTypes,
        ],
        code: "500",
      });

    return categoryInfos;
  }
}

export default CategoryModel;
