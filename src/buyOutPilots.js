const { By} = require("selenium-webdriver");
const { navigateBackHome, getElementsWithWait, switchToPopupConfirmAndBack, findElementByTextAndClick, takeScreenshot } = require("./utils");

async function buyOutPilots(driver, counts) {
    try {
        await findElementByTextAndClick(driver, "Graveyard");

        const hasKilledPilots = counts.find(group => group.name === "Killed").count > 0;

        if (hasKilledPilots) {
            await redeemPilots(driver, "Killed");
        }

        const hasCapturedPilots = counts.find(group => group.name === "Captured").count > 0;

        if (hasCapturedPilots) {
            await redeemPilots(driver, "Captured");
        }
    } catch(err) {
        await takeScreenshot(driver, `./files/errors/buyout-error-${new Date().toISOString()}.png`);
        console.error(err);
    } finally {
        await navigateBackHome(driver);
    }
}

async function redeemPilots(driver, kind) {
    const selectAllText = " Select All ";
    const selectAllLocator = By.xpath(`//*[text()='${selectAllText}']`);
    const selectAllButtons =  await getElementsWithWait(driver, selectAllLocator, 60000);
    if (!selectAllButtons.length) {
        return false; // sth went wrong
    }

    await selectAllButtons[0].click();

    await findElementByTextAndClick(driver, kind === "Killed" ? "Revive" : "Release");

    await switchToPopupConfirmAndBack(driver, false);

    await driver.sleep(2000)

    await findElementByTextAndClick(driver, 'OK');
}

module.exports = {
    buyOutPilots,
}