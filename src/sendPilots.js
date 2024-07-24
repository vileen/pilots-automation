const { By } = require("selenium-webdriver");
const { navigateBackHome, getElementWithWait, switchToPopupConfirmAndBack, switchToEnforcersTab, findElementByTextAndClick } = require("./utils");

async function sendPilots(driver) {
    try {
        console.log("sending pilots");

        await findElementByTextAndClick(driver, "Operators Hub");

        const deployPilotsText = 'Deploy Pilots'; // The text you are looking for
        const deployPilotsLocator = By.xpath(`//*[text()='${deployPilotsText}']`);
        await getElementWithWait(driver, deployPilotsLocator);

        await sendForTab(driver);

        await switchToEnforcersTab(driver);

        await sendForTab(driver);
    } catch(err) {
      console.error(err);
    } finally {
        await navigateBackHome(driver);
    }
}

async function sendForTab(driver) {
    await findElementByTextAndClick(driver, ' Select All ');

    await driver.sleep(1000);

    // Define the regex pattern
    const regexPattern = /Deploy \(\d\)/;

    // Find all button elements
    let buttons = await driver.findElements(By.tagName('button'));

    // Iterate through buttons to find one that matches the regex pattern
    for (let button of buttons) {
        let text = await button.getText();
        if (regexPattern.test(text)) {
            await button.click();
            break;
        }
    }

    await findElementByTextAndClick(driver, 'I understand');

    const noPilotsMessageCheck = async () => {
        const noPilotsText = 'No Usable Pilots';
        const noPilotsLocator = By.xpath(`//*[text()='${noPilotsText}']`);
        await getElementWithWait(driver, noPilotsLocator, 60000 * 2);
    }

    await switchToPopupConfirmAndBack(driver, false, noPilotsMessageCheck);

    await findElementByTextAndClick(driver, 'OK');
}

module.exports = {
    sendPilots
}