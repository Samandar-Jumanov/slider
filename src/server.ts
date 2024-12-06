import express from 'express';
import bot from "./utils/bot"
import requestLogger from './common/middleware/requestLogger';
import { openAPIRouter } from "@/api-docs/openAPIRouter";
import { userRouter } from './api/user/userRouter';
import { adRouter } from './api/ad/ad.route';
import prisma from './lib/prisma';
import logger from './utils/logger';

const app = express();
app.use(express.json());

app.use(openAPIRouter);


app.get('/health', (req, res) => {
        res.status(200).json({ 
            status: 'OK', 
            message: 'Bot is running' 
        });
    });
    
app.use("/users" , userRouter)
app.use("/ads" , adRouter)
app.use(requestLogger)



async function testDbConnection() {
      try {

        await prisma.$connect()
        logger.info("Db connection established")

      } catch (error) {
         throw new Error("Database connection error")
      }
}


// i should add redis and cronJob 


/**
 *   When add is approved add the ad id and ad-count to the redis 
 *   Everytime cronJob works it should check ads on redis to be sent to telegram bot
 *    When the ad_count is zero , delete adId from redis 
 * 
 */

app.listen(3001,   () => {

       testDbConnection()
       bot.launch()
       logger.info("Server started on port 3001")
});


