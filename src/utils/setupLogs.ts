import fs from "fs";
import path from "path";
import { logger } from "./logger.js";

export const setupLogsDirectory = (): void => {
  try {
    const logsDir = path.join(process.cwd(), "logs");

    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir);
      logger.info("Logs directory created successfully");
    }
  } catch (error) {
    console.error("Error creating logs directory:", error);
  }
};
