import { Router } from "express";
import UserController from "../../controllers/UserController";
import verifyJWT from "../../middlewares/verifyJWT";

const UsersRouter = Router();

UsersRouter.use(verifyJWT);

UsersRouter.route("/")
  .get(async (req, res) => {
    const usersController = new UserController(req, res);
    await usersController.getAllUsers();
  })
  .delete(async (req, res) => {
    const usersController = new UserController(req, res);
    await usersController.deleteAllUsers();
  });

UsersRouter.route("/:userId")
  .get(async (req, res) => {
    const usersController = new UserController(req, res);
    await usersController.getUser();
  })
  .put(async (req, res) => {
    const userController = new UserController(req, res);
    await userController.updateUser();
  })
  .delete(async (req, res) => {
    const userController = new UserController(req, res);
    await userController.deleteUser();
  });

export default UsersRouter;
