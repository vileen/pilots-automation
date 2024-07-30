const DEFAULT_TIMEOUT = 30000; // 30 seconds

async function findElementByText(page, text, timeout = DEFAULT_TIMEOUT, multiple = false) {
    const xPath = `xpath/.//*[contains(text(), '${text}')]`;
    await page.waitForSelector(xPath, { visible: true, timeout })
    if (multiple) {
        return page.$$(xPath);
    }

    return page.$(xPath);
}

async function findElementByTextAndClick(page, text, timeout = DEFAULT_TIMEOUT, customEval, useParent = false) {
    const element = await findElementByText(page, text, timeout);
    await sleep(1000);

    if (customEval) {
        await page.$eval(customEval, el => el.click())
    } else {
        if (useParent) {
            await element.evaluate(el => el.parentElement.click());
        } else {
            await element.click();
        }
    }
}

async function takeScreenshot(page, path) {
    await page.screenshot({ path, fullPage: true });

    console.log(`Screenshot saved to ${path}`);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function switchToPopupConfirmAndBack(browser, page, isSubmit = true, callback, debug = false) {
    await sleep(5000); // Wait for the connection to be established

    const allPages = await browser.pages();

    if (allPages.length === 1) {
        throw new Error("popup not opened");
    }

    const popup = allPages[allPages.length - 1];

    await sleep(2000); // Wait for the connection to be established

    if (debug) {
        await takeScreenshot(popup, `./files/debug/popup-debug-${new Date().toISOString()}.png`);
    }

    try {
        let confirmButton;
        try {
            confirmButton = await findElementByText(popup, "Confirm")
        } catch(err) {
        }

        if (!confirmButton) {
            try {
                await findElementByText(popup, 'The crypto wallet that’ll take you places');

                await takeScreenshot(popup, `./files/debug/popup-debug-2-${new Date().toISOString()}.png`);
            } catch(err) {
            }

            const passwordInputElement = await popup.waitForSelector(`//*[@data-testid="unlock-form-password-input"]`, { timeout: DEFAULT_TIMEOUT });
            if (passwordInputElement) {
                await passwordInputElement.type(process.env.WALLET_PASSWORD);
            }

            const unlockButton = await popup.waitForSelector(`//*[@data-testid="unlock-form-submit-button"]`, { timeout: DEFAULT_TIMEOUT });
            await unlockButton.click();
        }
    } catch(err) {
    }

    await findElementByTextAndClick(popup, "Confirm", 60000, isSubmit && 'button[type="submit"]' || '[data-testid="primary-button"]');

    if (callback) {
        await callback();
    }
}

async function navigateBackHome(browser, page) {
    await sleep(2000);
    try {
        console.log("navigate back home");
        const xPath = `xpath/.//*[@alt="Home Icon"]`;
        await page.waitForSelector(xPath, { visible: true });
        const backToHome = await page.$(xPath);

        return backToHome.click();
    } catch(err) {
        await takeScreenshot(page, `./files/errors/back-home-error-${new Date().toISOString()}.png`);
        console.error(err);
    }
}

async function navigateToGraveyard(browser, page) {
    try {
        await page.goto('https://v2.taiyopilots.com/graveyard');
        return findElementByTextAndClick(page, "Connect", undefined, undefined, true);
    } catch(err) {
        console.error(err);
        await takeScreenshot(page, `./files/errors/go-to-graveyard-error-${new Date().toISOString()}.png`);
    }
}

async function switchToTab(browser, page, tabName) {
    const xPath = `img[alt="Chevron Down Icon"]`;
    await page.waitForSelector(xPath, { visible: true, timeout: DEFAULT_TIMEOUT })
    const checkboxElements = await page.$$(xPath);

    for (const element of checkboxElements) {
        const textContent = await page.evaluate(el => el.parentElement.parentElement.textContent, element);
        if (textContent.includes(tabName)) {
            await page.evaluate(el => el.parentElement.parentElement.children[0].children[0].click(), element);
            return;
        }
    }
}

module.exports = {
    DEFAULT_TIMEOUT,
    findElementByText,
    findElementByTextAndClick,
    navigateBackHome,
    navigateToGraveyard,
    sleep,
    switchToPopupConfirmAndBack,
    switchToTab,
    takeScreenshot,
}