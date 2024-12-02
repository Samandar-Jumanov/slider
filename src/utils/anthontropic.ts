import { Anthropic } from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config()

class AIContentGenerator {
    private anthropic: Anthropic;

    constructor() {
        dotenv.config();

        if (!process.env.ANTHROPIC_API_KEY) {
            throw new Error('Anthropic API Key is required');
        }

        this.anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY
        });
    }

    async generateReferatContent(topic: string): Promise<string> {
        try {
            // const response = await this.anthropic.messages.create({
            //     model: "claude-2.0", 
            //     max_tokens: 2000,
            //     messages: [
            //         { 
            //             role: "assistant", 
            //             content: "Siz professional akademik matn generatori sifatida ishlaysiz. Mavzuga oid ilmiy va analitik matn yarating." 
            //         },
            //         { 
            //             role: "user", 
            //             content: `${topic} mavzusida to'liq va professional referat yozing.` 
            //         }
            //     ]
            // });

            // console.log({ response })

            return "Message is good thing to do";
        } catch (error) {
            console.error('Anthropic API error:', error);
            throw new Error('Referat generatsiya qilishda xatolik');
        }
    }
}


export default AIContentGenerator