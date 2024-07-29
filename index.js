require('@dotenvx/dotenvx').config();
const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const path = require('path');
const { setupWallet, connectToApp } = require("./src/init");
const { claimPilots } = require("./src/claimPilots");
const { sendPilots } = require("./src/sendPilots");
const { buyOutPilots } = require("./src/buyOutPilots");
const { saveDataToCsv } = require("./src/saveToCsv");
const cron = require('node-cron');

// Path to the Phantom wallet extension .crx file
const extensionPath = path.resolve('./files/phantom.crx');

// Configure Chrome options to load the extension
const options = new chrome.Options();
options.addExtensions(extensionPath);
options.addArguments('--no-sandbox');
options.addArguments('--disable-gpu');
options.addArguments('--disable-dev-shm-usage');
options.addArguments("--disable-search-engine-choice-screen");
options.addArguments('window-size=1280,800'); // Set the desired width and height
if (process.env.ENVIRONMENT !== "development") {
    options.addArguments('--headless=new'); // comment for debugging
}

const extensionId = "bfnaelmomeimhlpmgjnjophhpkkoljpa"; // chrome.management.getAll() code is not working, so I hardcoded it

async function sendPilotsToMissions() {
    let result = false;
    // Initialize the Chrome WebDriver with the options
    let driver;
    if (process.env.ENVIRONMENT === "development") {
        driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();
    } else {
        driver = await new Builder()
            .forBrowser('chrome')
            .usingServer('http://localhost:4444/wd/hub')  // Connect to Docker container
            .setChromeOptions(options)
            .build();
    }

    try {
        // Allow some time for the extension to load
        await driver.sleep(5000);

        // switch to first tab since phantom automatically opens a new tab
        const handles = await driver.getAllWindowHandles();
        await driver.switchTo().window(handles[1]);
        await driver.close();
        await driver.switchTo().window(handles[0]);

        // Get the extension ID
        // const extensions = await driver.executeScript('return chrome.management.getAll()');
        // const phantomExtension = extensions.find(ext => ext.name === 'Phantom');
        // const extensionId = phantomExtension.id;

        // Switch to the Phantom extension popup
        await driver.get(`chrome-extension://${extensionId}/onboarding.html`);

        // Allow some time for the extension to load
        await driver.sleep(1000);

        const isSetup = await setupWallet(driver);

        if (isSetup) {
            // Now you can navigate to your web app and interact with it
            await driver.get('https://v2.taiyopilots.com/');

            // Perform actions on the web app
            const isConnected = await connectToApp(driver);

            if (isConnected) {
                console.log("starting");

                const counts = await claimPilots(driver);
                // await buyOutPilots(driver, counts);
                // await sendPilots(driver);
                // await saveDataToCsv(counts);

                console.log("success");

                result = true;
            }
        } else {
            throw new Error("Failed to setup wallet")
        }
    } finally {
        console.log("finished");
        await driver.quit();
    }
    return result;
}

if (process.env.ENVIRONMENT !== "development") {
    // Schedule a task to run every 4 hours
    cron.schedule('0 */4 * * *', async () => {
        console.log(`Running cron job at ${new Date().toISOString()}`);

        let retries = 3;
        while (retries > 0) {
            try {
                console.log(`retries left ${retries}`)
                const result = await sendPilotsToMissions();
                if (result) {
                    break;
                } else {
                    console.log("retrying cause of error");
                    retries--;
                }
            } catch (err) {
                console.error(err);
                console.log("retrying cause of error");
                retries--;
            }
        }
    });
}

console.log("App started");
sendPilotsToMissions();
