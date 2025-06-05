import { cyanBright, red } from "console-log-colors";
import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();

const connectDB = async (): Promise<mongoose.Connection> => {
  try {
    const con = await mongoose.connect(process.env.MONGODB_URI || "", {
      maxPoolSize: 50,
      serverSelectionTimeoutMS: 3000000,
      socketTimeoutMS: 30000000,
    });
    console.log(
      cyanBright(`${process.env.DB_NAME} Connected: ${con.connection.host}`)
    );

    mongoose.connection.on("disconnected", () => {
      console.log(red("Mongoose connection is disconnected."));
    });
    return con.connection;
  } catch (error) {
    console.log("found Error on Connection=>", error);
    process.exit(1);
  }
};

connectDB();

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  process.exit(0);
});
