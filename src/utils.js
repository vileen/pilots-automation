const { until, By } = require('selenium-webdriver');
const fs = require('fs');

const DEFAULT_TIMEOUT = 30000; // 20 seconds
const extensionId = "bfnaelmomeimhlpmgjnjophhpkkoljpa"; // chrome.management.getAll() code is not working, so I hardcoded it

async function switchToPopupConfirmAndBack(driver, isSubmit = true, callback, debug = false) {
    await driver.sleep(5000); // Wait for the connection to be established

    const originalWindow = await driver.getWindowHandle();

    try {
        await driver.wait(async () => {
            const handles = await driver.getAllWindowHandles();
            const ret = handles.length > 1;
            if (ret) {
                console.log(`handles length: ${handles.length}`);
            }
            return ret;
        }, 60000);
    } catch(err) {
        console.log("popup did not show up")
        await takeScreenshot(driver, `./files/errors/popup-error-${new Date().toISOString()}.png`);
        // pass error down
        throw new Error(err);
    }

    // Get all window handles
    const allWindows = await driver.getAllWindowHandles();
    const popupWindow = allWindows.find(handle => handle !== originalWindow);

    // Switch to the popup window
    await driver.switchTo().window(popupWindow);
    await driver.sleep(2000); // Wait for the connection to be established

    if (debug) {
        await takeScreenshot(driver, `./files/errors/popup-debug-${new Date().toISOString()}.png`);
    }

    try {
        const wrongHandleText = 'The crypto wallet that’ll take you places'; // The text you are looking for
        const wrongHandleLocator = By.xpath(`//*[text()='${wrongHandleText}']`);
        await getElementWithWait(driver, wrongHandleLocator);
        await takeScreenshot(driver, `./files/errors/popup-debug-2-${new Date().toISOString()}.png`);
        // if for whatever reason it opened phantom.app, try to navigate to the notification page
        await driver.get(`chrome-extension://${extensionId}/notification.html`);
        await takeScreenshot(driver, `./files/errors/popup-debug-3-${new Date().toISOString()}.png`);
    } catch(err) {
    }

    try {
        const enterPasswordLocator = By.xpath('//*[@data-testid="unlock-form-password-input"]');
        const enterPassword = await getElementWithWait(driver, enterPasswordLocator, 3000);
        await enterPassword.sendKeys(process.env.WALLET_PASSWORD);

        const unlockLocator = By.xpath('//*[@data-testid="unlock-form-submit-button"]');
        const unlockButton = await getElementWithWait(driver, unlockLocator, 3000);
        await unlockButton.click();
    } catch(err) {
    }

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

async function findElementByTextAndClick(driver, text, timeout = DEFAULT_TIMEOUT) {
    const elementLocator = By.xpath(`//*[text()='${text}']`);
    const element = await getElementWithWait(driver, elementLocator, timeout);

    return element.click();
}

async function navigateBackHome(driver) {
    try {
        console.log("navigate back home");
        const homeIconLocator = By.xpath('//*[@alt="Home Icon"]');
        const homeIconElement = await getElementWithWait(driver, homeIconLocator, 60000 * 2);
        console.log("waiting for home button to be visible");
        await driver.wait(until.elementIsVisible(homeIconElement), 30000);
        console.log("waiting for home button to be enabled");
        await driver.wait(until.elementIsEnabled(homeIconElement), 30000);

        return homeIconElement.click();
    } catch(err) {
        await takeScreenshot(driver, `./files/errors/back-home-error-${new Date().toISOString()}.png`);
        console.error(err);
    }
}

async function takeScreenshot(driver, filePath) {
    const base64Data = await driver.takeScreenshot();
    fs.writeFileSync(filePath, base64Data, 'base64');
    console.log(`Screenshot saved to ${filePath}`);
}

async function goToGraveyard(driver) {
    await driver.get('https://v2.taiyopilots.com/graveyard');
    await findElementByTextAndClick(driver, "Connect");
}

async function reconnect(driver) {
    try {
        await driver.wait(async () => {
            try {
                const walletShort = process.env.WALLET_SHORT_PUBLIC_KEY;
                const walletShortLocator = By.xpath(`//*[text()='${walletShort}']`);
                await getElementWithWait(driver, walletShortLocator, 60000);

                return true;
            } catch(err) {
            }

            let handles = await driver.getAllWindowHandles();
            if (handles.length > 1) {
                await takeScreenshot(driver, `./files/errors/debugging-1-${new Date().toISOString()}.png`);
                await driver.switchTo().window(handles[1]);
                await driver.close();
                await driver.switchTo().window(handles[0]);
                await takeScreenshot(driver, `./files/errors/debugging-2-${new Date().toISOString()}.png`);
                handles = await driver.getAllWindowHandles();
                console.log(handles.length);
            }
            try {
                console.log("wallet short not there, trying to reconnect")

                await findElementByTextAndClick(driver, "Connect");
                await takeScreenshot(driver, `./files/errors/debugging-3-${new Date().toISOString()}.png`);
                handles = await driver.getAllWindowHandles();
                console.log(handles.length);
                // verify
                console.log("verifying");
                const walletShort = process.env.WALLET_SHORT_PUBLIC_KEY;
                const walletShortLocator = By.xpath(`//*[text()='${walletShort}']`);
                await getElementWithWait(driver, walletShortLocator, 60000);

                return true;
            } catch(err) {
                return false;
            }
        }, 60000*10);
    } catch(err) {
        console.error(err);
    }
}

module.exports = {
    goToGraveyard,
    findElementByTextAndClick,
    navigateBackHome,
    getElementWithWait,
    getElementsWithWait,
    switchToEnforcersTab,
    switchToPopupConfirmAndBack,
    takeScreenshot,
    reconnect
}