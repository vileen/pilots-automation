const { By, until } = require("selenium-webdriver");
const { navigateBackHome, getElementWithWait, getElementsWithWait, switchToPopupConfirmAndBack, switchToEnforcersTab, findElementByTextAndClick, takeScreenshot, reconnect } = require("./utils");

async function sendPilots(driver) {
    try {
        console.log("sending pilots");

        console.log("going to ops hub");
        const opsHubText = 'Operators Hub'; // The text you are looking for
        const opsHubLocator = By.xpath(`//*[text()='${opsHubText}']`);
        const opsHubElement = await getElementWithWait(driver, opsHubLocator);
        const opsHubContainer = await opsHubElement.findElement(By.xpath('..'))
        const opsHubTile = await opsHubContainer.findElement(By.xpath('..'))
        await opsHubTile.click();

        console.log("checking for deploy pilots");
        const deployPilotsText = 'Deploy Pilots'; // The text you are looking for
        const deployPilotsLocator = By.xpath(`//*[text()='${deployPilotsText}']`);
        await getElementWithWait(driver, deployPilotsLocator);

        console.log("reconnecting");
        await reconnect(driver);

        console.log("sending");
        await sendForTab(driver);

        await switchToEnforcersTab(driver);

        await sendForTab(driver);
    } catch(err) {
        await takeScreenshot(driver, `./files/errors/send-for-tab-error-${new Date().toISOString()}.png`);
        console.error(err);
    } finally {
        await navigateBackHome(driver);
    }
}

async function sendForTab(driver) {
    try {
        await findElementByTextAndClick(driver, ' Select All ');

        // for whatever reason this is not working...
        // Find the image element by its alt attribute using CSS selector
        const imageLocator = By.css('img[alt="Chest Icon"]');
        const imageElements = await getElementsWithWait(driver, imageLocator);
        const deployButton = await imageElements[0].findElement(By.xpath('..'));
        console.log("waiting for deploy button to be visible");
        await driver.wait(until.elementIsVisible(deployButton), 30000);
        console.log("waiting for deploy button to be enabled");
        await driver.wait(until.elementIsEnabled(deployButton), 30000);

        console.log("click");
        await deployButton.click();
        console.log("successful click");

        console.log("find i understand and click");
        await findElementByTextAndClick(driver, 'I understand');
        console.log("i understand success");

        const noPilotsMessageCheck = async () => {
            const noPilotsText = 'No Usable Pilots';
            const noPilotsLocator = By.xpath(`//*[text()='${noPilotsText}']`);
            await getElementWithWait(driver, noPilotsLocator, 60000 * 2);
        }

        await switchToPopupConfirmAndBack(driver, false, noPilotsMessageCheck);

        await findElementByTextAndClick(driver, 'OK');
    } catch(err) {
        await takeScreenshot(driver, `./files/errors/send-for-tab-error-${new Date().toISOString()}.png`);
        console.error(err);
    }
}

module.exports = {
    sendPilots
}