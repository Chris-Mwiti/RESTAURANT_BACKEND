import { Request, Response } from "express";
import {
  UserRecordWithoutId,
} from "../../Interfaces/IModels";
import AuthController from "./Authcontroller";
import trycatchHelper from "../../utils/tryCatchHelper";
import { checkErrProperties } from "../../helpers/customError";
import ResponseHandler from "../../utils/modelResponseHandler";
import { User } from "@prisma/client";

class RegisterController {
  constructor(private req: Request, private res: Response) {
    this.req = req;
    this.res = res;
  }

  public async createUser() {
    const userInfo: UserRecordWithoutId = this.req.body;

    const authController = new AuthController("local");

    const { data: isUserExisting, error: checkErr } =
      await trycatchHelper<User>(() =>
        authController.CheckIfUserExists(userInfo.email)
      );

    if (checkErr) {
      console.log(checkErr);
      return checkErrProperties(this.res, checkErr);
    }

    if (isUserExisting)
      return this.res.status(400).json({ err: "user already exists" });

    const { data: newUser, error: postErr } = await trycatchHelper<User>(() =>
      authController.CreateUser(userInfo)
    );
    if (postErr) return checkErrProperties(this.res, postErr);

    new ResponseHandler<User | null>(this.res, newUser).postResponse();
  }
}

export default RegisterController;
