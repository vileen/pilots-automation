const { By} = require("selenium-webdriver");
const { getElementWithWait, getElementsWithWait, switchToPopupConfirmAndBack, changeUrl} = require("./utils");

async function buyOutPilots(driver, counts) {
    await changeUrl(driver, 'https://v2.taiyopilots.com/graveyard'); // to graveyard

    const hasKilledPilots = counts.find(group => group.name === "Killed").count > 0;

    if (hasKilledPilots) {
        await redeemPilots(driver, "Killed");
    }

    const hasCapturedPilots = counts.find(group => group.name === "Captured").count > 0;

    if (hasCapturedPilots) {
        await redeemPilots(driver, "Captured");
    }

    await changeUrl(driver, 'https://v2.taiyopilots.com'); // back to home
}

async function redeemPilots(driver, kind) {
    const selectAllText = " Select All ";
    const selectAllLocator = By.xpath(`//*[text()='${selectAllText}']`);
    const selectAllButtons =  await getElementsWithWait(driver, selectAllLocator, 60000);
    if (!selectAllButtons.length) {
        return false; // sth went wrong
    }

    await selectAllButtons[0].click();

    const releaseText = kind === "Killed" ? "Revive" : "Release";
    const releaseLocator = By.xpath(`//*[text()='${releaseText}']`);
    const releaseElement =  await getElementWithWait(driver, releaseLocator);
    await releaseElement.click();

    await switchToPopupConfirmAndBack(driver, false);

    // TODO test again, it couldnt find ok last time
    const okText = 'OK';
    const okLocator = By.xpath(`//*[text()='${okText}']`);
    const okElement = await getElementWithWait(driver, okLocator);
    await okElement.click();
}

module.exports = {
    buyOutPilots,
}