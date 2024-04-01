import winston, { format, transports } from "winston";
const { timestamp, combine, label, printf } = format;
import path from "path";

const pathRedirector = (pathName: string) => {
  const newPath = path.join(__dirname, "../../logs/", pathName);
  return newPath;
};

const customLoggerFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp}\t[${label}]\t${level}\t${message}`;
});

function logger(loggerLabel: string) {
  return winston.createLogger({
    level: "debug",
    format: combine(
      label({ label: loggerLabel }),
      timestamp(),
      customLoggerFormat
    ),
    transports: [
      new transports.Console(),
      new transports.File({
        filename: pathRedirector("errLogs.txt"),
        level: "error",
      }),
      new transports.File({
        filename: pathRedirector("warnLogs.txt"),
        level: "warn",
      }),
      new transports.File({
        filename: pathRedirector("infoLogs.txt"),
        level: "info",
      }),
    ],
  });
}

export default logger;
