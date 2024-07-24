const { By } = require("selenium-webdriver");
const { getElementWithWait, switchToPopupConfirmAndBack, switchToEnforcersTab, changeUrl} = require("./utils");

async function sendPilots(driver) {
    try {
        console.log("sending pilots");

        await changeUrl(driver, 'https://v2.taiyopilots.com/pve/operators');

        const deployPilotsText = 'Deploy Pilots'; // The text you are looking for
        const deployPilotsLocator = By.xpath(`//*[text()='${deployPilotsText}']`);
        await getElementWithWait(driver, deployPilotsLocator);

        await sendForTab(driver);

        await switchToEnforcersTab(driver);

        await sendForTab(driver);
    } catch(err) {
      console.error(err);
    }
}

async function sendForTab(driver) {
    const sendAllPilotsText = ' Select All ';
    const sendAllPilotsLocator = By.xpath(`//*[text()='${sendAllPilotsText}']`);
    const sendAllPilotsButton = await getElementWithWait(driver, sendAllPilotsLocator);
    await sendAllPilotsButton.click();

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

    const iUnderstandText = 'I understand';
    const iUnderstandLocator = By.xpath(`//*[text()='${iUnderstandText}']`);
    const iUnderstandButton = await getElementWithWait(driver, iUnderstandLocator);
    await iUnderstandButton.click();

    const noPilotsMessageCheck = async () => {
        const noPilotsText = 'No Usable Pilots';
        const noPilotsLocator = By.xpath(`//*[text()='${noPilotsText}']`);
        await getElementWithWait(driver, noPilotsLocator, 60000);
    }

    await switchToPopupConfirmAndBack(driver, false, noPilotsMessageCheck);

    const okText = 'OK';
    const okLocator = By.xpath(`//*[text()='${okText}']`);
    const okElement = await getElementWithWait(driver, okLocator);
    await okElement.click();
}

module.exports = {
    sendPilots
}