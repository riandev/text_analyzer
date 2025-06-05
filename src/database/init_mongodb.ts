import { cyanBright } from "console-log-colors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { logger } from "../utils/logger.js";
dotenv.config();

const connectDB = async (): Promise<mongoose.Connection> => {
  try {
    const con = await mongoose.connect(process.env.MONGODB_URI || "", {
      maxPoolSize: 50,
      serverSelectionTimeoutMS: 3000000,
      socketTimeoutMS: 30000000,
    });
    logger.info(
      cyanBright(`${process.env.DB_NAME} Connected: ${con.connection.host}`)
    );

    mongoose.connection.on("disconnected", () => {
      logger.error("Mongoose connection is disconnected.");
    });
    return con.connection;
  } catch (error) {
    logger.error("found Error on Connection=>", error);
    process.exit(1);
  }
};

connectDB();

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  process.exit(0);
});
