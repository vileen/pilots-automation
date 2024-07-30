const { navigateBackHome, navigateToGraveyard, takeScreenshot, findElementByText, findElementByTextAndClick, switchToPopupConfirmAndBack, sleep } = require("./newUtils");

async function buyOutPilots(browser, page, counts) {
    try {
        console.log("buying out pilots");
        await navigateToGraveyard(browser, page);

        await sleep(5000)

        const hasKilledPilots = counts.find(group => group.name === "Killed").count > 0;

        if (hasKilledPilots) {
            await redeemPilots(browser, page, "Killed");
        }

        const hasCapturedPilots = counts.find(group => group.name === "Captured").count > 0;

        if (hasCapturedPilots) {
            await redeemPilots(browser, page, "Captured");
        }
    } catch(err) {
        await takeScreenshot(page, `./files/errors/buyout-error-${new Date().toISOString()}.png`);
        console.error(err);
    } finally {
        await navigateBackHome(browser, page);
    }
}

async function redeemPilots(browser, page, kind) {
    const text = kind === "Killed" ? "Graveyard" : "Captured";
    const pilotsStatus = await findElementByText(page, text);
    const parent = await page.evaluateHandle(el => el.parentElement.parentElement, pilotsStatus);
    const selectAllButton = await page.evaluateHandle((parent, text) => {
        const elements = parent.querySelectorAll('*');
        for (const element of elements) {
            if (element.textContent.trim() === text) {
                return element;
            }
        }
        return null;
    }, parent, 'Select All');
    await page.evaluate(element => element.click(), selectAllButton);
    await findElementByTextAndClick(page, kind === "Killed" ? "Revive" : "Release", undefined, undefined, true);

    await switchToPopupConfirmAndBack(browser, page, false);

    await sleep(2000)

    await findElementByTextAndClick(page, 'OK', 60000 * 3);
}

module.exports = {
    buyOutPilots,
}