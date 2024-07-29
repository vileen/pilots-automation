const { By } = require("selenium-webdriver");
const { getElementWithWait, switchToPopupConfirmAndBack, findElementByTextAndClick, takeScreenshot } = require("./utils");

async function setupWallet(driver) {
    console.log("setting up wallet");
    try {
        await findElementByTextAndClick(driver, "Import an existing wallet");
        await findElementByTextAndClick(driver, "Import Private Key");

        // Define the placeholder text and the input value
        const namePlaceholderText = 'Name'; // The placeholder attribute value
        const nameValue = 'main'; // The value you want to type

        // Locate the input element by its placeholder attribute
        const nameInputLocator = By.css(`input[placeholder='${namePlaceholderText}']`)
        const nameInputElement = await getElementWithWait(driver, nameInputLocator);

        // Type into the input element
        await nameInputElement.sendKeys(nameValue);

        // Define the placeholder text and the input value
        const privateKeyText = 'Private key'; // The placeholder attribute value
        const privateKeyValue = process.env.WALLET_PRIVATE_KEY; // The value you want to type

        // Locate the input element by its placeholder attribute
        const privateKeyInputLocator = By.css(`textarea[placeholder='${privateKeyText}']`)
        const privateKeyInputElement = await getElementWithWait(driver, privateKeyInputLocator);

        // Type into the input element
        await privateKeyInputElement.sendKeys(privateKeyValue);

        await findElementByTextAndClick(driver, "Import");

        // Define the placeholder text and the input value
        const passwordPlaceholderText = 'Password'; // The placeholder attribute value
        const confirmPasswordPlaceholderText = 'Confirm Password'; // The placeholder attribute value
        const passwordValue = process.env.WALLET_PASSWORD; // The value you want to type

        // Locate the input element by its placeholder attribute
        const passwordInputLocator = By.css(`input[placeholder='${passwordPlaceholderText}']`);
        const passwordInputElement = await getElementWithWait(driver, passwordInputLocator);

        // Type into the input element
        await passwordInputElement.sendKeys(passwordValue);

        // Locate the input element by its placeholder attribute
        const confirmPasswordInputLocator = By.css(`input[placeholder='${confirmPasswordPlaceholderText}']`);
        const confirmPasswordInputElement = await getElementWithWait(driver, confirmPasswordInputLocator);

        // Type into the input element
        await confirmPasswordInputElement.sendKeys(passwordValue);

        // Locate the parent element (modify the locator as needed)
        const termsOfServiceCheckboxParentLocator = By.css('[data-reach-custom-checkbox-container]');
        const termsOfServiceCheckboxParent = await getElementWithWait(driver, termsOfServiceCheckboxParentLocator);
        // Locate the first child element using CSS selector
        const termsOfServiceCheckbox = await termsOfServiceCheckboxParent.findElement(By.css(':first-child'));
        termsOfServiceCheckbox.click();

        const continueButtonText = "Continue";
        const continueButtonLocator = By.xpath(`//*[text()='${continueButtonText}']`);
        const continueButton = await getElementWithWait(driver, continueButtonLocator);
        await continueButton.click();

        const getStartedButtonText = "Get Started";
        const getStartedButtonLocator = By.xpath(`//*[text()='${getStartedButtonText}']`);
        await getElementWithWait(driver, getStartedButtonLocator, 60000); // just wait for element, don't click to avoid closing target window
        // await getStartedButton.click();

        return true;
    } catch (e) {
        await takeScreenshot(driver, `./files/errors/init-error-${new Date().toISOString()}.png`);
        console.error(`Error during login: ${e}`);
    }

    return false;
}

async function connectToApp(driver) {
    try {
        console.log("connecting to app");

        await findElementByTextAndClick(driver, " Select Wallet ", 60000);

        await driver.sleep(1000);

        const connectWalletLocator = By.xpath(`//*[text()='Connect Wallet']`);
        await getElementWithWait(driver, connectWalletLocator);

        await findElementByTextAndClick(driver, "Phantom");

        await driver.sleep(2000); // Wait for the connection to be established

        await findElementByTextAndClick(driver, "Connect");

        await switchToPopupConfirmAndBack(driver);

        const walletShort = process.env.WALLET_SHORT_PUBLIC_KEY;
        const walletShortLocator = By.xpath(`//*[text()='${walletShort}']`);
        await getElementWithWait(driver, walletShortLocator, 60000);
    } catch(err) {
        await takeScreenshot(driver, `./files/errors/connect-error-${new Date().toISOString()}.png`);
        console.error(err);
        return false;
    }

    return true;
}

module.exports = {
    setupWallet,
    connectToApp
}