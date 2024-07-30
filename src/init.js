const { findElementByText, findElementByTextAndClick, DEFAULT_TIMEOUT, takeScreenshot, sleep, switchToPopupConfirmAndBack } = require("./newUtils");

async function setupWallet(page) {
    console.log("setting up wallet");
    try {
        await findElementByTextAndClick(page, "Import an existing wallet");
        await findElementByTextAndClick(page, "Import Private Key");

        // Define the placeholder text and the input value
        const namePlaceholderText = 'Name'; // The placeholder attribute value
        const nameValue = 'main'; // The value you want to type

        // Locate the input element by its placeholder attribute
        const nameInputElement = await page.waitForSelector(`input[placeholder="${namePlaceholderText}"]`, { timeout: DEFAULT_TIMEOUT });
        if (nameInputElement) {
            await nameInputElement.type(nameValue);
        }

        // Define the placeholder text and the input value
        const privateKeyText = 'Private key'; // The placeholder attribute value
        const privateKeyValue = process.env.WALLET_PRIVATE_KEY; // The value you want to type

        // Locate the input element by its placeholder attribute
        const privateKeyInputElement = await page.waitForSelector(`textarea[placeholder="${privateKeyText}"]`, { timeout: DEFAULT_TIMEOUT });
        if (privateKeyInputElement) {
            await privateKeyInputElement.type(privateKeyValue);
        }

        await findElementByTextAndClick(page, "Import", undefined, 'button[type="submit"]');

        // Define the placeholder text and the input value
        const passwordPlaceholderText = 'Password'; // The placeholder attribute value
        const confirmPasswordPlaceholderText = 'Confirm Password'; // The placeholder attribute value
        const passwordValue = process.env.WALLET_PASSWORD; // The value you want to type

        // Locate the input element by its placeholder attribute
        const passwordInputElement = await page.waitForSelector(`input[placeholder="${passwordPlaceholderText}"]`, { timeout: DEFAULT_TIMEOUT });
        if (passwordInputElement) {
            await passwordInputElement.type(passwordValue);
        }

        // Locate the input element by its placeholder attribute
        const confirmPasswordInputElement = await page.waitForSelector(`input[placeholder="${confirmPasswordPlaceholderText}"]`, { timeout: DEFAULT_TIMEOUT });
        if (confirmPasswordInputElement) {
            await confirmPasswordInputElement.type(passwordValue);
        }

        const termsOfServiceCheckbox = 'input[type="checkbox"]';
        await page.waitForSelector(termsOfServiceCheckbox);
        await page.click(termsOfServiceCheckbox);

        await sleep(1000);

        await findElementByTextAndClick(page, "Continue");

        await sleep(1000);

        await findElementByText(page, "Get Started", 60000 * 3);

        return true;
    } catch (e) {
        await takeScreenshot(page, `./files/errors/init-error-${new Date().toISOString()}.png`);
        console.error(`Error during login: ${e}`);
    }

    return false;
}

async function connectToApp(browser, page) {
    try {
        console.log("connecting to app");

        await sleep(3000);

        await findElementByTextAndClick(page, " Select Wallet ", 60000);

        await sleep(1000);

        await findElementByText(page, "Connect Wallet");

        await findElementByTextAndClick(page, "Phantom");

        await sleep(2000); // Wait for the connection to be established

        await findElementByTextAndClick(page, "Connect");

        await switchToPopupConfirmAndBack(browser, page, true);

        await findElementByText(page, process.env.WALLET_SHORT_PUBLIC_KEY, 60000);
    } catch(err) {
        console.error(err);
        await takeScreenshot(page, `./files/errors/connect-error-${new Date().toISOString()}.png`);
        return false;
    }

    return true;
}

module.exports = {
    setupWallet,
    connectToApp
}