import mongoose from "mongoose";
import app from "./app";
import path from "path";
import { Server } from "http";
import adminSeeder from "./seeder/adminSeeder";
import config from "./config";
import "./modules/job/job.cron";
import planSeeder from "./seeder/planSeeder";
import "./modules/notifications/notifications.utill"
import skillsSeeder from "./seeder/skillsSeeder";

let server: Server;

async function main() {
  try {
    console.log("connecting to mongodb....⏳");
    await mongoose.connect(config.mongoose_uri);
    await adminSeeder();
    await planSeeder();
    // await skillsSeeder();
    server = app.listen(config.port, () => {
      console.log(`AI Mock Interview server app listening on port ${config.port}`);
    });
  } 
  catch (err:any) {
    throw Error('something went wrong in server or mongoose connection');
  }
}
main();

// Global unhandled promise rejection handler
process.on('unhandledRejection', async (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Gracefully shutting down the server
  if (server) {
    try {
      server.close(() => {
        console.log(
          'Server and MongoDB connection closed due to unhandled rejection.',
        );
        process.exit(1); // Exit the process with an error code
      });
    } catch (err) {
      console.error('Error during shutdown:', err);
      process.exit(1); // Exit with error code if shutting down fails
    }
  } else {
    process.exit(1);
  }
});

// Global uncaught exception handler
process.on('uncaughtException', async (err) => {
  console.error('Uncaught Exception:', err);
  // Gracefully shutting down the server
  if (server) {
    try {
      server.close(() => {
        console.log(
          'Server and MongoDB connection closed due to uncaught exception.',
        );
        process.exit(1); // Exit the process with an error code
      });
    } catch (err) {
      console.error('Error during shutdown:', err);
      process.exit(1); // Exit with error code if shutting down fails
    }
  } else {
    process.exit(1);
  }
});
