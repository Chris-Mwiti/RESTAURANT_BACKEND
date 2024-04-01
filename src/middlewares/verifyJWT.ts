import { NextFunction, Request, Response } from "express";
import jsonwebtoken from "jsonwebtoken";

interface IReqCookies {
  accessToken: string;
  refreshToken: string;
}

export type TReqUser = {
  userId: string;
};

function verifyJWT(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"]?.split(" ");
  console.log(authHeader);
  if (authHeader) {
    const [bearer, accessToken, refreshToken] = authHeader;

    if (!refreshToken || !accessToken)
      return res.status(401).json({ err: "No header properties were found" });

    const decryptedToken = jsonwebtoken.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET as string
    );

    if (typeof decryptedToken === "string")
      return res.status(500).json({ err: "Error while decrypting token" });

    if ("userId" in decryptedToken) {
      return next();
    } else {
      return res.status(401);
    }
  } else {
    res.status(401).json({ err: "Unauthorized access" });
  }
}

function getUserId(req: Request, res: Response) {
  const authHeader = req.headers["authorization"]?.split(" ");
  if (authHeader) {
    const [bearer, accessToken, refreshToken] = authHeader;

    if (!refreshToken || !accessToken)
      return res.status(401).json({ err: "No header properties were found" });

    const decryptedToken = jsonwebtoken.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET as string
    );

    if (typeof decryptedToken === "string")
      return res.status(500).json({ err: "Error while decrypting token" });

    if ("userId" in decryptedToken) {
      return decryptedToken.userId;
    }else {
        return res.status(401).json({msg: "You are unauthirized to finalize the order"})
    }
  }
}

export {
    getUserId
}

export default verifyJWT;
