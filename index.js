require('@dotenvx/dotenvx').config();
const path = require('path');
const { setupWallet, connectToApp } = require("./src/init");
const { claimPilots } = require("./src/claimPilots");
const { sendPilots } = require("./src/sendPilots");
const { buyOutPilots } = require("./src/buyOutPilots");
const { saveDataToCsv } = require("./src/saveToCsv");
const cron = require('node-cron');
const puppeteer = require('puppeteer');
const { sleep } = require("./src/newUtils");

const isDev = process.env.ENVIRONMENT === "development";

// Path to the Phantom wallet extension .crx file
const extensionPath = path.resolve('./files/phantom');

async function sendPilotsToMissions() {
    const browser = await puppeteer.launch({
        headless: !isDev, // Puppeteer must be non-headless to capture the video
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized', `--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`, '--enable-automation'],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    // // Start screen recording using Puppeteer
    // const puppeteerVideo = require('puppeteer-video-recorder');
    // const recorder = new puppeteerVideo.Recorder(page);
    // await recorder.start('./files/videos/test-recording.mp4');

    try {
        // allow extension to load
        await sleep(4000);

        // // Switch to the Phantom extension popup
        const allPages = await browser.pages();

        const extensionPage = allPages.find(p => {
            return p.url().startsWith('chrome-extension://');
        });
        if (extensionPage) {
            // Switch to the extension url to avoid switching target
            await page.goto(extensionPage.url());
            await page.bringToFront();
        }

        // Close all pages except the current one
        for (const p of allPages) {
            if (p !== page) {
                await p.close();
            }
        }

        // sometimes setup gets stuck on get started button
        const isSetup = async () => {
            let retryCount = 3;
            while (retryCount > 0) {
                try {
                    return await setupWallet(page);
                } catch (e) {
                    await page.reload();
                    console.log(`${retryCount} attempts left`);
                    retryCount--;
                }
            }
        };

        const result = await isSetup();
        if (result) {
            // Now you can navigate to your web app and interact with it
            await page.goto('https://v2.taiyopilots.com/');

            // Perform actions on the web app
            const isConnected = await connectToApp(browser, page);

            if (isConnected) {
                console.log("starting");

                await sleep(2000);

                const counts = await claimPilots(browser, page);
                await buyOutPilots(browser, page, counts);
                await sendPilots(browser, page);
                await saveDataToCsv(counts);

                console.log("success");
            }
        } else {
            throw new Error("Failed to setup wallet")
        }
    } finally {
        console.log("finished");
        await browser.close();
    }
}

if (!isDev) {
    // Schedule a task to run every 4 hours
    cron.schedule('0 */4 * * *', async () => {
        console.log(`Running cron job at ${new Date().toISOString()}`);

        sendPilotsToMissions();
    });
} else {
    sendPilotsToMissions();
}

console.log("App started");
