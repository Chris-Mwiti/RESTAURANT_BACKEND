import { Request, Response } from "express";
import trycatchHelper from "../utils/tryCatchHelper";
import CategoryModel from "../models/Categories";
import { checkErrProperties } from "../helpers/customError";
import { PrismaErrorTypes } from "../helpers/prismaErrHandler";
import { Category } from "@prisma/client";
import logger from "../utils/logger";
import ResponseHandler from "../utils/modelResponseHandler";

class CategoryController {
  private readonly res: Response;
  private readonly req: Request;
  public readonly body: Request["body"];
  protected model = CategoryModel;

  constructor(req: Request, res: Response) {
    this.req = req;
    this.res = res;
    this.body = req.body;
  }

  public async createCategory() {
    logger("cetegory").info("Creating category");
    const { data: createInfo, error: createErr } =
      await trycatchHelper<Category>(() =>
        this.model.createCategory(this.body)
      );

    if (createErr)
      return checkErrProperties(this.res, createErr as PrismaErrorTypes);

    return new ResponseHandler<Category | null>(
      this.res,
      createInfo
    ).postResponse();
  }

  public async getAllCategories() {
    logger("category").info("Fetching categories");
    const { data: infos, error: fetchRrror } = await trycatchHelper<Category[]>(
      () => this.model.getAllCategories()
    );
    if (fetchRrror)
      return checkErrProperties(this.res, fetchRrror as PrismaErrorTypes);

    return new ResponseHandler<Category[] | null>(
      this.res,
      infos
    ).getResponse();
  }
}

export default CategoryController;
