import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientRustPanicError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
} from "@prisma/client/runtime/library";
import logger from "../utils/logger";

export type PrismaErrorTypes =
  | PrismaClientKnownRequestError
  | PrismaClientInitializationError
  | PrismaClientUnknownRequestError
  | PrismaClientRustPanicError
  | PrismaClientValidationError
  | [string, PrismaErrorTypes];

function prismaErrHandler(err: PrismaErrorTypes) {
  if (Array.isArray(err)) {
    logger("[DB_ERROR]").error(`${err[0]}\t${err[1]}`);
  } else {
    logger("[DB_ERROR]").error(`${err?.message}\t ${err?.name}`);
    console.error(err.message);
  }
}

export default prismaErrHandler;
