import { Request, Response } from "express";
import UserModel from "../models/Users";
import trycatchHelper from "../utils/tryCatchHelper";
import { IUserLoginCredentials } from "../Interfaces/IModels";
import ResponseHandler from "../utils/modelResponseHandler";
import CustomError, { checkErrProperties } from "../helpers/customError";
import { User } from "@prisma/client";
import AuthController from "./auth/Authcontroller";
import logger from "../utils/logger";
import jsonwebtoken from 'jsonwebtoken'

class UserController {
  //Initialize the user model & record id generator
  private model = UserModel;

  constructor(private req: Request, private res: Response) {
    this.req = req;
    this.res = res;
  }

  public async getUser() {
    logger("users").info("Fetching user");
    const { userId } = this.req.params;
    const { data: currentUser, error: fetchErr } = await trycatchHelper<User>(
      () => this.model.getUser(userId)
    );
    if (fetchErr)
      this.res
        .status(500)
        .json({ err: `Error while fetching user: ${userId}` });
    new ResponseHandler<User | null>(this.res, currentUser).getResponse();
  }

  public async getAllUsers() {
    logger("users").info("Fetching users");
    const { data: usersInfo, error: fetchErr } = await trycatchHelper<User[]>(
      () => this.model.getUsers()
    );

    if (fetchErr) return checkErrProperties(this.res, fetchErr);

    new ResponseHandler<User[] | null>(this.res, usersInfo).getResponse();
  }

  public async loginUser() {
      const userInfo: IUserLoginCredentials = this.req.body;

      const authController = new AuthController("local");
      const { data: user, error: checkErr } = await trycatchHelper<User>(() =>
        authController.CheckIfUserExists(userInfo.email)
      );
      if (checkErr) return checkErrProperties(this.res, checkErr);

      if (!user)
        return this.res
          .status(404)
          .json({ err: "Incorrect email or User does not exist" });

      //Checks if the user logged in via a provider such as google or facebook...
      if (!user.password)
        return this.res
          .status(400)
          .json({ err: "Please log in back via a provider" });

      const isPasswordCorrect = await authController.DecryptPassword(
        user.password,
        userInfo.password
      );
      if (!isPasswordCorrect)
        return this.res.status(401).json({ err: "Wrong password" });

    const accessTokenMaxAge = 15 * 60 * 1000;
    const refreshTokenMaxAge = 24 * 60 * 60 * 1000;

  console.log("Checking headers...");
  //Checks if a refreshToken or accessToken already exists
  const authHeader = this.req.headers["authorization"];
  let headerAccessToken: string | undefined,
    headerRefreshToken: string | undefined;

  console.log(authHeader);
  if (authHeader) {
    const [bearer, accessToken, refreshToken] = authHeader.split(" ");
    console.log(accessToken,refreshToken);
    headerAccessToken = accessToken;
    headerRefreshToken = refreshToken;
  }

  if (!user) return this.res.status(404).json({ err: "User does not exist" });

  const accessToken = jsonwebtoken.sign(
    { userId: user["id"] },
    process.env.ACCESS_TOKEN_SECRET as string,
    { expiresIn: accessTokenMaxAge }
  );

  const refreshToken = jsonwebtoken.sign(
    { userId: user.id },
    process.env.REFRESH_TOKEN_SECRET as string,
    { expiresIn: refreshTokenMaxAge }
  );

  //Reassign a new accessToken if one has already expired by use of the refreshToken assigned
  if (!headerAccessToken && headerRefreshToken) {
    const decryptedRefreshToken = jsonwebtoken.verify(
      headerRefreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    );
    if (typeof decryptedRefreshToken === "string")
      return this.res.status(401).json({ err: "Unauthorized" });
    if ("userId" in decryptedRefreshToken) {
      this.res.status(200).json({
        accessToken,
        refreshToken,
        user
      });
      
    }
  } else if (!headerRefreshToken && headerAccessToken) {
    console.log("2.");
    //Client browser already has an accessToken
    this.res.status(200).json({msg: "Success"})

  } else {
    console.log("Adding cookies..");
    this.res.status(200).json({
      accessToken,
      refreshToken,
      user
    });
  }
}

  //Used for updating users info
  public async updateUser() {
    logger("users").info("Updating user");
    const { userId } = this.req.params;
    const userInfo: Partial<User> = this.req.body;

    //Check if its a password change
    if ("password" in userInfo) {
      userInfo.password = await new AuthController("local").HashPassword(
        userInfo.password!
      );
    }

    delete userInfo.id;

    const { data: updatedUser, error: updateErr } = await trycatchHelper<User>(
      () => this.model.updateUser(userInfo, userId)
    );
    if (updateErr)
      this.res
        .status(500)
        .json({ err: `Error while updating user: ${userId}` });
    new ResponseHandler<User | null>(this.res, updatedUser).updateResponse();
  }

  public async deleteUser() {
    logger("users").info("Deleting user");
    const { userId } = this.req.params;
    const { data: deletedUser, error: deleteError } =
      await trycatchHelper<User>(() => this.model.deleteUser(userId));
    if (deleteError)
      this.res
        .status(500)
        .json({ err: `Error while deleting user: ${userId}` });
    new ResponseHandler<User | null>(this.res, deletedUser).deleteResponse();
  }

  public async deleteAllUsers() {
    logger("users").info("Deliting users");
    const { data: deletedUsers, error: deleteErr } = await trycatchHelper<
      User[]
    >(() => this.model.deleteAllUsers());

    if (deleteErr) return checkErrProperties(this.res, deleteErr);

    new ResponseHandler<User[] | null>(this.res, deletedUsers).deleteResponse();
  }
}

export default UserController;
