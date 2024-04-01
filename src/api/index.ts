import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import ErrMiddleWareHandler from "../middlewares/errHandler";
import cors from "cors";
import corsOptions from "../config/corsConfig";
import AuthRouter from "../routes/auth/auth.routes";
import ProductRouter from "../routes/api/products.routes";
import CategoryRouter from "../routes/api/category.routes";
import OrdersRouter from "../routes/api/orders.routes";
import UsersRouter from "../routes/api/users.routes";


/* ---------------- Server set up ----------------------- */

const app: Express = express();

/* -------------- MiddleWares Setup -------------- */

dotenv.config();
app.use(cors(corsOptions));


// Body parser
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false, limit: "50mb" }));

// Request Logger

/* -------------- Routes Setup ----------------- */

app.get("/", (req, res) => res.send("Welcome to Madrigal"));

// Auth routes
app.use("/auth", AuthRouter);

//API routes
app.use("/api/users", UsersRouter);
app.use("/api/product", ProductRouter);
app.use("/api/category", CategoryRouter);
app.use("/api/orders", OrdersRouter);


/** -------- End of Routes setup  */

// Error Logger
app.use(ErrMiddleWareHandler.ErrHandler);

/** ----------- End of middlewares setup -------------- */

//Server port listener
app.listen(process.env.DEVELOPMENT_PORT, () => {
  console.log(
    "The sever is up and running on port: " + process.env.DEVELOPMENT_PORT
  );
});
