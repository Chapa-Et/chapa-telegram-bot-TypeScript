import { Bot } from "grammy";
import { config } from "dotenv";

// Load the environment variables from the .env file
config();

const CHAPA_TOKEN = process.env.PROVIDER_TOKEN;
const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
    console.log("ERROR: Missing bot token in environment variables");
    process.exit(1);
}

if (!CHAPA_TOKEN) {
    console.log("ERROR: Missing chapa token in environment variables");
    process.exit(1);
}

const bot = new Bot(BOT_TOKEN);

// Handle the /start command.
bot.command("start", async (ctx) => {
    const invoiceTitle = "Test Product";
    const invoiceDescription =
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";
    const invoicePayload = `${ctx.message?.from.id}-${ctx.me.id}-${ctx.message?.message_id
        }-${new Date().toISOString()}`;
    const invoiceProviderToken = CHAPA_TOKEN;
    const invoiceCurrency = "ETB";
    const invoiceItems = [{ label: "Test Product", amount: 100 * 100 }];
    const invoiceOptions = {
        max_tip_amount: 100 * 100,
        suggested_tip_amounts: [5 * 100, 10 * 100, 25 * 100, 50 * 100],
        photo_url: "https://via.placeholder.com/300/09f/fff.png",
    };

    await ctx.replyWithInvoice(
        invoiceTitle,
        invoiceDescription,
        invoicePayload,
        invoiceProviderToken,
        invoiceCurrency,
        invoiceItems,
        invoiceOptions
    );
});

// Register the pre_checkout_query handler
bot.on("pre_checkout_query", async (ctx) => {
    await ctx.answerPreCheckoutQuery(true, ctx.preCheckoutQuery.id);
});

// Register the successful_payment handler
bot.on(":successful_payment", async (ctx) => {
    const totalAmount = (ctx.message?.successful_payment.total_amount ?? 0) / 100;
    const currency = ctx.message?.successful_payment.currency;
    await ctx.reply(
        `We've just received your payment ${totalAmount} ${currency} 
        and wanted to say thank you for choosing our shop.`
    );
});

bot.start();
