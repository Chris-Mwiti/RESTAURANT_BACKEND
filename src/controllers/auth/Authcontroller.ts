/**
 * Creates new users depending on the strategy selected:("Google", "JWT" or "LOCAL");
 * Retrives user info from the database;
 * Authorizes if a user has qualified to access certain resources
 *
 */

import UserModel from "../../models/Users";
import prismaClient from "../../config/prismaConfig";
import trycatchHelper from "../../utils/tryCatchHelper";
import { UserRecord, UserRecordWithoutId } from "../../Interfaces/IModels";
import CustomError from "../../helpers/customError";
import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
import dotenv from "dotenv";
import logger from "../../utils/logger";
import { ObjectId } from "bson";
import { User } from "@prisma/client";
dotenv.config();

type AuthStrategies = "google" | "local";

// @TODO: Create guards that will verify if specific properties in an object exists || null || undefined

class AuthController {
  private UserModel = prismaClient.user;

  constructor(private strategies: AuthStrategies) {
    this.strategies = strategies;
  }

  public async CheckIfUserExists(userInfo: string) {
    //Narrows down the userInfo types to a string && IUserPartialId respectively
    let email: string;
    if (typeof userInfo === "string") email = userInfo;

    if (typeof userInfo === "object" && "googleId" in userInfo) {
      // Checks if there is any existing users based on there googleId
      if (this.strategies === "google") {
        console.log("Hello google user");
      }
    } else {
      // Checks if user exists based on their email
      const { data: retrivedUser, error: fetchErr } =
        await trycatchHelper<User>(() =>
          this.UserModel.findUnique({
            where: {
              email: email,
            },
            include: {
              orderDetails: {
                include: {
                  items: {
                    include: {
                      product: {
                        select: {
                          productName: true,
                          productDescription: true,
                          sellingPrice: true,
                          asset: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          })
        );
      if (fetchErr) {
        console.log(fetchErr);
        throw new CustomError({
          message: "Error while retrieving user",
          code: "500",
        });
      }

      if (!retrivedUser) return null;
      return retrivedUser;
    }
  }
  

  public async getUser(id: string) {
    const { data: currentUser, error: fetchErr } = await trycatchHelper<User>(
      () =>
        this.UserModel.findUnique({
          where: {
            id: id,
          },
          include: {
            orderDetails: {
              include: {
                items: {
                  include: {
                    product: {
                      select: {
                        productName: true,
                        productDescription: true,
                        sellingPrice: true,
                        asset: true,
                      },
                    },
                  },
                },
              },
            },
          },
        })
    );
    if (fetchErr)
      throw new CustomError({
        message: "Error while retrieving user",
        code: "500",
      });
    if (!currentUser)
      throw new CustomError({ message: "User not found", code: "404" });
    return currentUser;
  }

  public async CreateUser(userInfoObj: UserRecordWithoutId) {
    logger("user").debug("Creating user");
    // Generates a new user id

    const userId = new ObjectId().toHexString();

    //Create a new user obj containing the generated id
    let userInfo = { ...userInfoObj, id: userId };

    if (this.strategies === "local") {
      if (userInfoObj.password) {
        const hashedPassword = await this.HashPassword(userInfoObj.password);
        userInfo = { ...userInfoObj, id: userId, password: hashedPassword };
      }
    }

    const { data: newUser, error: postErr } = await trycatchHelper<User>(() =>
      UserModel.createUser(userInfo)
    );
    if (postErr)
      throw new CustomError({
        message: "Error while creating user",
        code: "500",
      });

    return newUser;
  }

  public async HashPassword(password: string) {
    if (this.strategies !== "local")
      throw new CustomError({
        message: "Wrong implementation of strategy",
        code: "400",
      });
    const hashedPassword = await bcrypt.hash(password, 12);
    return hashedPassword;
  }

  public async DecryptPassword(
    hashedPassword: string | undefined,
    password: string
  ) {
    if (this.strategies !== "local")
      throw new CustomError({
        message: "Wrong implementation of strategy",
        code: "400",
      });

    if (!hashedPassword) return false;
    const isPasswordCorrect = await bcrypt.compare(password, hashedPassword);

    return isPasswordCorrect;
  }

  public GenerateJWTToken(userInfo: UserRecord) {
    const { id } = userInfo;
    const accessToken = jsonwebtoken.sign(
      { userId: id },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: 15 * 60 }
    );
    const refreshToken = jsonwebtoken.sign(
      { userId: id },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: 15 * 60 }
    );

    return { accessToken, refreshToken };
  }

  public static DecodeJWTToken(token: string) {
    return jsonwebtoken.decode(token);
  }
}

export default AuthController;
