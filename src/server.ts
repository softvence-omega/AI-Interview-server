// src/index.ts
import mongoose from 'mongoose';
import app from './app';
import path from 'path';
import { Server } from 'http';
import adminSeeder from './seeder/adminSeeder';
import config from './config';
import './modules/job/job.cron';
import planSeeder from './seeder/planSeeder';
import './modules/notifications/notifications.utill';
import skillsSeeder from './seeder/skillsSeeder';
import LoopPakageCleaner from './util/pakageClinner';
import initializeLandingPage from './seeder/landingpageSeeder';

let server: Server;

async function main() {
  try {
    console.log('Connecting to MongoDB....⏳');
    await mongoose.connect(config.mongoose_uri);
    await adminSeeder();
    await planSeeder();
    await initializeLandingPage()
    // await skillsSeeder();

    server = app.listen(config.port, () => {
      console.log(`AI Mock Interview server app listening on port ${config.port}`);
    });
  } catch (err: any) {
    throw Error('Something went wrong in server or mongoose connection');
  }
}

main();

process.on('unhandledRejection', async (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  if (server) {
    try {
      server.close(() => {
        console.log('Server and MongoDB connection closed due to unhandled rejection.');
        process.exit(1);
      });
    } catch (err) {
      console.error('Error during shutdown:', err);
      process.exit(1);
    }
  } else {
    process.exit(1);
  }
});

process.on('uncaughtException', async (err) => {
  console.error('Uncaught Exception:', err);
  if (server) {
    try {
      server.close(() => {
        console.log('Server and MongoDB connection closed due to uncaught exception.');
        process.exit(1);
      });
    } catch (err) {
      console.error('Error during shutdown:', err);
      process.exit(1);
    }
  } else {
    process.exit(1);
  }
});

//corn job section add all the corn function here 
LoopPakageCleaner()