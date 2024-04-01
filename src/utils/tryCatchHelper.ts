import logger from "./logger";

const trycatchHelper = async <DataType>(func: Function) => {
  let data = null;
  let error = null;
  try {
    const result: DataType = await func();
    data = result;
  } catch (UnknownError) {
    logger("async_error").error(error);
    error = UnknownError;
  }

  return { data, error };
};

export default trycatchHelper;
