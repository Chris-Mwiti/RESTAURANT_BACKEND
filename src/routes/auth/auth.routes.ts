
import { Router } from "express";

import RegisterController from "../../controllers/auth/RegisterController";
import UserController from "../../controllers/UserController";

/**
 * Authentification Router
 *
 * Paths: "/login", "/logout", "/google", "/login/google", "/login/google/redirect", "/register"
 */

const AuthRouter = Router();

AuthRouter.post("/register", async (req, res) => {
  const registerController = new RegisterController(req, res);
  await registerController.createUser();
});
//Login route
AuthRouter.post("/login", async (req,res) => {
    const userController = new UserController(req,res);
    await userController.loginUser()
});

// Logout route
AuthRouter.get("/logout", (req, res) => {
  res.send("You are being logged out");
});



export default AuthRouter;
