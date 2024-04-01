import { ICustomError } from "./customError";
import prismaErrHandler, { PrismaErrorTypes } from "./prismaErrHandler";

interface IDatabaseError {
  message: [string, PrismaErrorTypes];
  code: ICustomError["code"];
}

class DatabaseError extends Error {
  public readonly code: ICustomError["code"];

  constructor({ message, code }: IDatabaseError) {
    super(JSON.stringify(message[0]));
    this.code = code;
    prismaErrHandler(message);
  }
}

export default DatabaseError;
