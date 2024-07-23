const { By } = require("selenium-webdriver");
const { getElementWithWait, switchToPopupConfirmAndBack} = require("./utils");

async function setupWallet(driver) {
    console.log("setting up wallet");
    try {
        const importExistingText = "Import an existing wallet";
        const importExistingLocator = By.xpath(`//*[text()='${importExistingText}']`);
        const importExistingButton = await getElementWithWait(driver, importExistingLocator);
        await importExistingButton.click();

        const importByKeyText = "Import Private Key";
        const importByKeyLocator = By.xpath(`//*[text()='${importByKeyText}']`);
        const importByKeyButton = await getElementWithWait(driver, importByKeyLocator);
        await importByKeyButton.click();

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

        const importButtonText = "Import";
        const importButtonLocator = By.xpath(`//*[text()='${importButtonText}']`);
        const importButton = await getElementWithWait(driver, importButtonLocator);
        await importButton.click();

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
        console.error(`Error during login: ${e}`);
    }

    return false;
}

async function connectToApp(driver) {
    console.log("connecting to app");

    const selectWalletText = " Select Wallet "; // for whatever reason they put spaces in the text...
    const selectWalletButtonLocator = By.xpath(`//*[text()='${selectWalletText}']`);
    const selectWalletButton = await getElementWithWait(driver, selectWalletButtonLocator, 60000);
    await selectWalletButton.click();

    await driver.sleep(1000);

    const connectWalletLocator = By.xpath(`//*[text()='Connect Wallet']`);
    await getElementWithWait(driver, connectWalletLocator);

    const phantomWalletText = "Phantom";
    const phantomWalletLocator = By.xpath(`//*[text()='${phantomWalletText}']`);
    const phantomWalletButton = await getElementWithWait(driver, phantomWalletLocator);
    await phantomWalletButton.click();

    await driver.sleep(2000); // Wait for the connection to be established

    const connectText = "Connect";
    const connectLocator = By.xpath(`//*[text()='${connectText}']`);
    const connectButton = await getElementWithWait(driver, connectLocator);
    await connectButton.click();

    await switchToPopupConfirmAndBack(driver);

    const walletShort = process.env.WALLET_SHORT_PUBLIC_KEY;
    const walletShortLocator = By.xpath(`//*[text()='${walletShort}']`);
    await getElementWithWait(driver, walletShortLocator, 30000);

    return true;
}

module.exports = {
    setupWallet,
    connectToApp
}