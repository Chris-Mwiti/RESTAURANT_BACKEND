import { NextFunction, Request, Response } from "express";
import LoggerHelper from "../utils/logger";
import CustomError from "../helpers/customError";
import logger from "../utils/logger";

// Custom Error handler

class ErrMiddleWareHandler {
  public static ErrHandler(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    if (res.headersSent) {
      return next(err);
    }
    logger("error").error("An Error has occurred");
    if (err instanceof CustomError) {
      res.status(Number(err.code)).json({ err: err.message });
    } else {
      res.status(500).json({ err: "Server side error" });
    }
    console.error(err.stack);
  }
}

export default ErrMiddleWareHandler;
