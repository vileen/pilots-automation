const { until, By } = require('selenium-webdriver');
const fs = require('fs');

const DEFAULT_TIMEOUT = 20000; // 20 seconds

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

async function findElementByTextAndClick(driver, text, timeout) {
    const elementLocator = By.xpath(`//*[text()='${text}']`);
    const element = await getElementWithWait(driver, elementLocator, timeout);

    return element.click();
}

async function navigateBackHome(driver) {
    const homeIconLocator = By.xpath('//*[@alt="Home Icon"]');
    const homeIconElement = await getElementWithWait(driver, homeIconLocator);

    return homeIconElement.click();
}

async function takeScreenshot(driver, filePath) {
    const base64Data = await driver.takeScreenshot();
    fs.writeFileSync(filePath, base64Data, 'base64');
    console.log(`Screenshot saved to ${filePath}`);
}

module.exports = {
    findElementByTextAndClick,
    navigateBackHome,
    getElementWithWait,
    getElementsWithWait,
    switchToEnforcersTab,
    switchToPopupConfirmAndBack,
    takeScreenshot
}