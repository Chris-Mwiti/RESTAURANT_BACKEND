import { CorsOptions } from "cors";

const whiteListedDomains: string[] = [
  "http://localhost:5000",
  "http://localhost:3000",
  "http://localhost:5173",
];

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    return callback(null, true);
  },
  optionsSuccessStatus: 200,
  credentials: true,
};

export default corsOptions;
