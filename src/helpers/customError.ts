import { Response } from "express";
import DatabaseError from "./databaseError";

export type ErrorCodes = "400" | "404" | "500";

export interface ICustomError {
  message: string;
  code: ErrorCodes;
}

// Extends the Error object by adding a code property
class CustomError extends Error {
  public readonly code: ErrorCodes;
  constructor({ message, code }: ICustomError) {
    super(JSON.stringify(message));
    this.code = code;
    this.name = "Custom Error";
  }
}

export function checkErrProperties(
  res: Response,
  err: Error | CustomError | DatabaseError | string | {}
) {
  //Checks if there is an
  if (err instanceof CustomError) {
    console.log(err);
    res.status(parseInt(err.code)).json({ err: err.message });
  } else if (err instanceof DatabaseError) {
    console.log(err);
    res
      .status(parseInt(err.code))
      .json({ err: typeof err === "string" ? err : err.message });
  } else if (err instanceof Error) {
    console.log(err);
    res.status(500).json({ err: err.message });
  } else {
    console.log(err);
    res.status(500).json({ err: err });
  }
}

export default CustomError;
