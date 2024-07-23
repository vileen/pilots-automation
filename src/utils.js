const { until, By} = require('selenium-webdriver');

const DEFAULT_TIMEOUT = 10000; // 10 seconds

async function switchToPopupConfirmAndBack(driver, isSubmit = true, callback) {
    await driver.sleep(2000); // Wait for the connection to be established

    const originalWindow = await driver.getWindowHandle();

    await driver.wait(async () => {
        const handles = await driver.getAllWindowHandles();
        return handles.length > 1;
    }, 60000);

    // Get all window handles
    const allWindows = await driver.getAllWindowHandles();
    const popupWindow = allWindows.find(handle => handle !== originalWindow);

    // Switch to the popup window
    await driver.switchTo().window(popupWindow);
    await driver.sleep(2000); // Wait for the connection to be established

    const confirmButtonText = "Confirm";
    const submitButtonLocator = isSubmit ? By.xpath('//button[@type="submit"]') : By.xpath(`//*[text()='${confirmButtonText}']`);
    const submitButton = await getElementWithWait(driver, submitButtonLocator, 60000);
    await submitButton.click();

    // wait for handle to be removed
    await driver.wait(async () => {
        const handles = await driver.getAllWindowHandles();
        return handles.length === 1;
    }, 60000);

    // Switch back to the original window
    await driver.switchTo().window(originalWindow);

    if (callback) {
        await callback();
    }
}

async function getElementWithWait (driver, locator, timeout = DEFAULT_TIMEOUT) {
    // Wait for the element to be present and visible
    await driver.wait(until.elementLocated(locator), timeout);
    await driver.wait(until.elementIsVisible(await driver.findElement(locator)), timeout);

    // Perform actions on the element after it is found and visible
    return driver.findElement(locator);
}

async function getElementsWithWait(driver, locator, timeout = DEFAULT_TIMEOUT) {
    // Wait for the element to be present and visible
    await driver.wait(until.elementsLocated(locator), timeout);

    // Perform actions on the element after it is found and visible
    return driver.findElements(locator);
}

async function switchToEnforcersTab(driver) {
    const enforcersText = 'Enforcers'; // The text you are looking for
    const enforcersLocator = By.xpath(`//*[text()='${enforcersText}']`);
    const enforcersElement = await getElementWithWait(driver, enforcersLocator);

    // Get the parent element
    const parentElement = await driver.executeScript('return arguments[0].parentNode;', enforcersElement);

    // Get the previous sibling of the parent element
    const checkbox = await driver.executeScript('return arguments[0].previousElementSibling;', parentElement);
    await checkbox.click();
}

async function reconnectInitialisedWallet(driver) {
    try {
        const selectWalletText = " Select Wallet "; // for whatever reason they put spaces in the text...
        const selectWalletButtonLocator = By.xpath(`//*[text()='${selectWalletText}']`);
        const selectWalletButton = await getElementWithWait(driver, selectWalletButtonLocator, 5000);
        await selectWalletButton.click();

        await driver.sleep(2000);
    } catch(err) {
    }

    try {
        const connectText = "Connect";
        const connectLocator = By.xpath(`//*[text()='${connectText}']`);
        const connectButton = await getElementWithWait(driver, connectLocator, 5000);
        await connectButton.click();
    } catch(err) {
    }
}

async function changeUrl(driver, url) {
    await driver.get(url); // to graveyard

    await reconnectInitialisedWallet(driver);

}

module.exports = {
    changeUrl,
    getElementWithWait,
    getElementsWithWait,
    switchToEnforcersTab,
    switchToPopupConfirmAndBack
}