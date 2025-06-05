import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";
import winston from "winston";
import { generateDashboardHtml } from "./dashboardTemplate.js";
import { logger } from "./logger.js";

const dashboardRouter = express.Router();

const logCache: any[] = [];
const MAX_LOGS = 1000;

const readLogsFromFile = (filePath: string, limit = 500): any[] => {
  try {
    if (!fs.existsSync(filePath)) {
      return [];
    }

    const content = fs.readFileSync(filePath, "utf8");
    return content
      .split("\n")
      .filter((line) => line.trim())
      .slice(-limit)
      .map((line) => {
        try {
          const match = line.match(
            /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}:\d+) (\w+): (.*)$/
          );
          if (match) {
            return {
              timestamp: match[1],
              level: match[2].toLowerCase(),
              message: match[3],
            };
          }
          return {
            timestamp: new Date().toISOString(),
            level: "info",
            message: line,
          };
        } catch (e) {
          return {
            timestamp: new Date().toISOString(),
            level: "info",
            message: line,
          };
        }
      });
  } catch (error) {
    console.error("Error reading log file:", error);
    return [];
  }
};

export const setupLogDashboard = () => {
  const memoryTransport = new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.printf((info) => {
        const timestamp = info.timestamp || new Date().toISOString();
        const level = info.level || "info";
        const message = info.message || "";
        logCache.unshift({ timestamp, level, message });

        if (logCache.length > MAX_LOGS) {
          logCache.length = MAX_LOGS;
        }

        return `${timestamp} ${level}: ${message}`;
      })
    ),
    silent: true,
  });

  logger.add(memoryTransport);
  dashboardRouter.get("/api", (req: Request, res: Response) => {
    const fileLogsAll = readLogsFromFile(
      path.join(process.cwd(), "logs", "all.log")
    );
    const fileLogsError = readLogsFromFile(
      path.join(process.cwd(), "logs", "error.log")
    );

    const allLogs = [...logCache, ...fileLogsAll, ...fileLogsError]
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, 500);

    return res.json({ logs: allLogs });
  });

  dashboardRouter.get("/", (req: Request, res: Response) => {
    const fileLogsAll = readLogsFromFile(
      path.join(process.cwd(), "logs", "all.log"),
      100
    );
    const fileLogsError = readLogsFromFile(
      path.join(process.cwd(), "logs", "error.log"),
      100
    );

    const allLogs = [...logCache, ...fileLogsAll, ...fileLogsError]
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, 200);

    const html = generateDashboardHtml(allLogs, "Text Analyzer API Logs");
    res.send(html);
  });

  logger.info("Winston Dashboard initialized and accessible at /logs");

  return dashboardRouter;
};

export const logDashboardMiddleware = (app: express.Application) => {
  app.use("/logs", dashboardRouter);
  logger.info("Winston Dashboard middleware mounted at /logs");
};
