const { findElementByText, findElementByTextAndClick, navigateBackHome, switchToPopupConfirmAndBack, takeScreenshot, DEFAULT_TIMEOUT,
    switchToTab, sleep
} = require("./newUtils");

async function sendPilots(browser, page) {
    try {
        console.log("sending pilots");

        console.log("going to ops hub");
        await findElementByTextAndClick(page, "Operators Hub");

        console.log("sending");
        await switchToTab(browser, page, "Rebels");
        await sendForTab(browser, page);

        await switchToTab(browser, page, "Enforcers");
        await sendForTab(browser, page);
    } catch(err) {
        await takeScreenshot(page, `./files/errors/send-for-tab-error-${new Date().toISOString()}.png`);
        console.error(err);
    } finally {
        await navigateBackHome(browser, page);
    }
}

async function sendForTab(browser, page) {
    try {
        const deployPilotsTitle = await findElementByText(page, "Deploy Pilots");
        const parent = await page.evaluateHandle(el => el.parentElement.parentElement, deployPilotsTitle);
        const selectAllButton = await page.evaluateHandle((parent, text) => {
            const elements = parent.querySelectorAll('*');
            for (let element of elements) {
                if (element.textContent.trim() === text) {
                    return element;
                }
            }
            return null;
        }, parent, 'Select All');
        await page.evaluate(element => element.click(), selectAllButton);

        await sleep(1000);

        const deployButton = await page.evaluateHandle((parent, text) => {
            const elements = parent.querySelectorAll('*');
            for (let element of elements) {
                if (element.textContent.trim().includes(text)) {
                    return element.querySelectorAll('button')[1];
                }
            }
            return null;
        }, parent, 'Deploy (');
        await page.evaluate(element => element.click(), deployButton);

        console.log("find i understand and click");
        await findElementByTextAndClick(page, 'I understand');
        console.log("i understand success");

        await sleep(3000);

        const noPilotsMessageCheck = async () => {
            console.log("waiting for no usable pilots message");
            await findElementByText(page, 'No Usable Pilots', 60000 * 5);
        }

        await sleep(2000);

        await switchToPopupConfirmAndBack(browser, page, false, noPilotsMessageCheck);

        await sleep(2000);

        await findElementByTextAndClick(page, 'OK');
    } catch(err) {
        await takeScreenshot(page, `./files/errors/send-for-tab-error-${new Date().toISOString()}.png`);
        console.error(err);
    }
}

module.exports = {
    sendPilots
}