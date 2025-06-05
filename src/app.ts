import cluster from "cluster";
import compression from "compression";
import { cyanBright, red } from "console-log-colors";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from "express";
import status from "express-status-monitor";
import helmet from "helmet";
import { createServer } from "http";
import mongoose from "mongoose";
import morgan from "morgan";
import os from "os";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import "./database/init_mongodb.js";
import "./database/init_redis.js";
import routes from "./routes/Routes.js";
import { setupLogDashboard } from "./utils/logDashboard.js";
import { logger } from "./utils/logger.js";
import { setupLogsDirectory } from "./utils/setupLogs.js";

interface CustomError extends Error {
  status?: number;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

setupLogsDirectory();

// Initialize Winston Dashboard and mount it to the app
const dashboardRouter = setupLogDashboard();

const app = express();
const httpServer = createServer(app);

app.use(status());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: function (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void
    ) {
      if (!origin) return callback(null, true);
      callback(null, true);
    },
    credentials: true,
  })
);

app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(morgan("dev"));
app.use(express.static("../dist"));
app.use(cookieParser());
app.use(compression());

app.use("/api", routes);
app.use("/logs", dashboardRouter);

const errorHandler: ErrorRequestHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(err.status || 500);

  const errorResponse = {
    error: {
      status: err.status || 500,
      ...err,
      message: err.message,
    },
  };
  logger.error(err.stack);
  res.send(errorResponse);
};

app.use(errorHandler);

app.get("*", (req: Request, res: Response) => {
  res.sendFile(join(__dirname, "../dist", "index.html"));
});

const numCpu = os.cpus()?.length;
const cpus =
  numCpu > 0 && numCpu <= 5 ? numCpu - 1 : numCpu > 8 ? numCpu - 2 : numCpu;
const PORT = process.env.PORT || 3000;

if (cluster.isPrimary) {
  for (let i = 0; i < cpus; i++) {
    cluster.fork();
  }
  cluster.on("exit", (worker, code, signal) => {
    logger.error(
      red(`worker ${worker.process.pid} with ${code} & Signal ${signal} killed`)
    );
    cluster.fork();
  });
} else {
  const server = httpServer.listen(PORT, () =>
    logger.info(
      cyanBright(`Server running on port ${PORT} with worker ${process.pid}`)
    )
  );

  process.on("SIGINT", () => {
    logger.info("SIGINT Received");
    server.close(() => {
      mongoose.connection.close().then(() => {
        process.exit(0);
      });
      logger.info("Server Closed ....");
    });
  });

  process.on("SIGTERM", () => {
    logger.info("SIGTERM Received");
    server.close(() => {
      mongoose.connection.close().then(() => {
        process.exit(0);
      });
      logger.info("Server Closed ....");
    });
  });
}

export default app;
