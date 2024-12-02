import express from 'express';
import bot from "./utils/bot"
import requestLogger from './common/middleware/requestLogger';

const app = express();
app.use(express.json());
app.get('/health', (req, res) => {
        res.status(200).json({ 
            status: 'OK', 
            message: 'Bot is running' 
        });
    });


app.use(requestLogger)


app.listen(3000,   () => {
         bot.launch();
        console.log('Bot is running')
});


