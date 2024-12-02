
import { Telegraf, Markup, Context } from 'telegraf';
import * as fs from 'fs/promises';
import * as path from 'path';
import { PDFDocument } from 'pdf-lib';
import logger from './logger';
import { config } from 'dotenv';

config();

enum ContentType {
  REFERAT = 'referat',
  PRESENTATION = 'presentation',
  INDEPENDENT_WORK = 'independentWork',
}

// Interface for user state
interface UserState {
  type: ContentType | null;
  topic: string | null;
  filePath: string | null;
  currentPageIndex: number;
  totalPages: number;
  isApproved: boolean[];
}

export class TelegramBotService {
  private bot: Telegraf;
  private userStates: Record<string, UserState> = {};

  constructor() {
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      throw new Error('Telegram bot token is not defined');
    }

    this.bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
    this.setupHandlers();
  }

  private setupHandlers() {
    this.bot.start(this.handleStart.bind(this));
    this.bot.hears('🗒️ Referat Yaratish', this.initializeContentCreation.bind(this, ContentType.REFERAT));
    this.bot.hears('📊 Prezentatsiya Yaratish', this.initializeContentCreation.bind(this, ContentType.PRESENTATION));
    this.bot.hears('📖 Mustaqil Ish Yaratish', this.initializeContentCreation.bind(this, ContentType.INDEPENDENT_WORK));
    this.bot.on('text', this.handleTopicInput.bind(this));
    this.bot.action('accept_page', this.acceptPage.bind(this));
    this.bot.action('reject_page', this.rejectPage.bind(this));
  }

  private handleStart(ctx: Context) {
    ctx.reply(
      'Salom! Referat, slide va mustaqil ish yaratish botiga xush kelibsiz!',
      Markup.keyboard([
        ['🗒️ Referat Yaratish', '📊 Prezentatsiya Yaratish'],
        ['📖 Mustaqil Ish Yaratish'],
      ]).resize(),
    );
  }

  private initializeContentCreation(type: ContentType, ctx: Context) {
    const userId = ctx.from?.id.toString();
    if (!userId) return;

    this.userStates[userId] = {
      type,
      topic: null,
      filePath: null,
      currentPageIndex: 0,
      totalPages: 0,
      isApproved: [],
    };

    const typeText = this.getTypeText(type);
    ctx.reply(`${typeText} mavzusini kiriting:`);
  }

  private getTypeText(type: ContentType): string {
    switch (type) {
      case ContentType.REFERAT:
        return 'Referat';
      case ContentType.PRESENTATION:
        return 'Prezentatsiya';
      case ContentType.INDEPENDENT_WORK:
        return 'Mustaqil ish';
      default:
        return 'Kontent';
    }
  }

  private async handleTopicInput(ctx: any ) {
    const userId = ctx.from?.id.toString();
    if (!userId || !this.userStates[userId]?.type) return;

    const userState = this.userStates[userId];
    const text = 'text' in ctx.message ? ctx.message.text : null;
    if (!text) return;

    userState.topic = text;

    const fileName = this.getFileName(userState.type!);
    const filePath = path.join(__dirname, 'files', fileName);

    try {
      await fs.access(filePath);
      userState.filePath = filePath;

      const pdfBuffer = await fs.readFile(filePath);
      const pdfDoc = await PDFDocument.load(pdfBuffer);

      userState.totalPages = pdfDoc.getPageCount();
      userState.isApproved = Array(userState.totalPages).fill(false);

      userState.currentPageIndex = 0;
      await this.sendPage(ctx, true); // Send first page
    } catch (error) {
      logger.error('Error processing file:', { error });
      ctx.reply('Faylni topishda xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.');
      delete this.userStates[userId];
    }
  }

  private getFileName(type: ContentType): string {
    switch (type) {
      case ContentType.REFERAT:
        return 'referat.pdf';
      case ContentType.PRESENTATION:
        return 'slide.pdf';
      case ContentType.INDEPENDENT_WORK:
        return 'mustaqil.pdf';
      default:
        throw new Error('Invalid content type');
    }
  }

  private async sendPage(ctx: Context, isFirstAttempt: boolean) {
    const userId = ctx.from?.id.toString();
    if (!userId) return;

    const userState = this.userStates[userId];
    if (!userState || !userState.filePath) return;

    if (userState.currentPageIndex >= userState.totalPages) {
      await this.sendFinalDocument(ctx);
      return;
    }

    try {
      const pdfBuffer = await fs.readFile(userState.filePath);
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const newPdfDoc = await PDFDocument.create();
      const [page] = await newPdfDoc.copyPages(pdfDoc, [userState.currentPageIndex]);
      newPdfDoc.addPage(page);

      const pageBuffer = await newPdfDoc.save();
      const tempFilePath = path.join(__dirname, `temp_page_${userId}_${userState.currentPageIndex}.pdf`);

      await fs.writeFile(tempFilePath, pageBuffer);

      if (!isFirstAttempt) {
        await ctx.reply('Boshqa varoq ishlanayapdi');
      }

      await ctx.replyWithDocument(
        {
          source: tempFilePath,
          filename: `Page_${userState.currentPageIndex + 1}.pdf`,
        },
        Markup.inlineKeyboard([
          [Markup.button.callback('Qabul qilish ✅', 'accept_page')],
          [Markup.button.callback('Rad etish ❌', 'reject_page')],
        ]),
      );

      await fs.unlink(tempFilePath);
    } catch (error) {
      logger.error('Error sending page:', { error });
      ctx.reply('Sahifani yuborishda xatolik yuz berdi.');
    }
  }

  private async sendFinalDocument(ctx: Context) {
    const userId = ctx.from?.id.toString();
    if (!userId) return;

    const userState = this.userStates[userId];
    if (!userState || !userState.filePath) return;

    try {
      const pdfBuffer = await fs.readFile(userState.filePath);
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const finalPdfDoc = await PDFDocument.create();

      for (let i = 0; i < userState.totalPages; i++) {
        if (userState.isApproved[i]) {
          const [page] = await finalPdfDoc.copyPages(pdfDoc, [i]);
          finalPdfDoc.addPage(page);
        }
      }

      const finalPdfBuffer = await finalPdfDoc.save();
      const finalFilePath = path.join(__dirname, `final_${userId}.pdf`);

      await fs.writeFile(finalFilePath, finalPdfBuffer);

      await ctx.replyWithDocument({
        source: finalFilePath,
        filename: `Final_Document.pdf`,
      });

      await fs.unlink(finalFilePath);
      delete this.userStates[userId];
    } catch (error) {
      logger.error('Error sending final document:', { error });
      ctx.reply('Yakuniy hujjatni yaratishda xatolik yuz berdi.');
    }
  }

  private async acceptPage(ctx: Context) {
    const userId = ctx.from?.id.toString();
    if (!userId) return;

    const userState = this.userStates[userId];
    if (!userState) return;

    userState.isApproved[userState.currentPageIndex] = true;
    userState.currentPageIndex++;
    await this.sendPage(ctx, true);
  }

  private async rejectPage(ctx: Context) {
    const userId = ctx.from?.id.toString();
    if (!userId) return;

    await ctx.answerCbQuery('Sahifa rad etildi');
    await this.sendPage(ctx, false); // Resend current page
  }

  launch() {
    this.bot.launch();
    logger.info('Telegram bot launched');

    process.once('SIGINT', () => this.bot.stop('SIGINT'));
    process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
  }
}

const bot = new TelegramBotService();
export default bot;
