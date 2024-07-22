require('@dotenvx/dotenvx').config();
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const path = require('path');
const { getElementWithWait } = require("./utils");

// Path to the Phantom wallet extension .crx file
const extensionPath = path.resolve('./files/phantom.crx');

// Configure Chrome options to load the extension
const options = new chrome.Options();
options.addExtensions(extensionPath);
// options.addArguments('--headless=new'); // todo once it works

const extensionId = "bfnaelmomeimhlpmgjnjophhpkkoljpa"; // above code is not working so I hardcoded it

(async function automatePhantomWallet() {
    // Initialize the Chrome WebDriver with the options
    const driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    try {
        // Allow some time for the extension to load
        await driver.sleep(1000);

        // switch to first tab since phantom automatically opens a new tab
        const tabs = await driver.getAllWindowHandles();
        await driver.switchTo().window(tabs[1]);
        await driver.close();
        await driver.switchTo().window(tabs[0]);

        // Get the extension ID
        // const extensions = await driver.executeScript('return chrome.management.getAll()');
        // const phantomExtension = extensions.find(ext => ext.name === 'Phantom');
        // const extensionId = phantomExtension.id;

        // Switch to the Phantom extension popup
        await driver.get(`chrome-extension://${extensionId}/onboarding.html`);

        // Allow some time for the extension to load
        await driver.sleep(1000);

        const isSetup = await setupWallet(driver);

        if (isSetup) {
            // Now you can navigate to your web app and interact with it
            await driver.get('https://v2.taiyopilots.com/');

            // Perform actions on the web app
            const isConnected = await connectToApp(driver);

            if (isConnected) {
                // const graveyardInfo = await getGraveyardInfo(driver);
                // await releasePilots(driver, graveyardInfo);
                await sendPilots(driver);
            }
        } else {
            throw new Error("Failed to setup wallet")
        }
    } finally {
        await driver.quit();
    }
})();

async function setupWallet(driver) {
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

// todo that doesn't work
async function getGraveyardInfo(driver) {
    let hasRevivablePilots = false;
    let hasReleasablePilots = false;

    try {
        const xpath = `//*[contains(text(), ' YOUR REVIVABLE PILOTS: ') and contains(text(), '0')]`;
        const revivableZeroLocator = By.xpath(xpath);
        await getElementWithWait(driver, revivableZeroLocator, 5000);
    } catch(err) {
        hasRevivablePilots = true;
    }

    try {
        const xpath = `//*[contains(text(), ' YOUR RELEASABLE PILOTS: ') and contains(text(), '0')]`;
        const releseableZeroLocator = By.xpath(xpath);
        await getElementWithWait(driver, releseableZeroLocator, 5000);
    } catch(err) {
        hasReleasablePilots = true;
    }

    return {
        hasRevivablePilots,
        hasReleasablePilots,
    };
}

async function releasePilots(driver, graveyardInfo) {
    if (graveyardInfo.hasRevivablePilots || graveyardInfo.hasReleasablePilots) {
        await retrievePilots(driver);
    }
}

// todo
async function retrievePilots(driver) {
    const selectAllText = "SELECT ALL";
    const selectAllButtons = await driver.findElements(By.xpath(`//*[text()='${selectAllText}']`));
    if (!selectAllButtons.length) {
        return false; // sth went wrong
    }

    await selectAllButtons[0].click();

    const reviveText = "REVIVE";
    const reviveButton = await driver.findElement(By.xpath(`//*[text()='${reviveText}']`));
    const isReviveButtonDisabled = await reviveButton.getAttribute('disabled') !== null;

    const releaseText = "REVIVE";
    const releaseButton = await driver.findElement(By.xpath(`//*[text()='${releaseText}']`));
    const isReleaseButtonDisabled = await releaseButton.getAttribute('disabled') !== null;

    if (selectAllButtons.length === 2) {
        return retrievePilots(driver);
    }

    return true;
}

async function sendPilots(driver) {
    const operatorsHubText = 'Operators Hub'; // The text you are looking for
    const operatorsHubLocator = By.xpath(`//*[text()='${operatorsHubText}']`);
    const operatorsHubElement = await getElementWithWait(driver, operatorsHubLocator);
    await operatorsHubElement.click();

    const deployPilotsText = 'Deploy Pilots'; // The text you are looking for
    const deployPilotsLocator = By.xpath(`//*[text()='${deployPilotsText}']`);
    await getElementWithWait(driver, deployPilotsLocator);

    // await sendByCount(driver, 6);

    const enforcersText = 'Enforcers'; // The text you are looking for
    const enforcersLocator = By.xpath(`//*[text()='${enforcersText}']`);
    const enforcersElement = await getElementWithWait(driver, enforcersLocator);

    // Get the parent element
    const parentElement = await driver.executeScript('return arguments[0].parentNode;', enforcersElement);

    // Get the previous sibling of the parent element
    const checkbox = await driver.executeScript('return arguments[0].previousElementSibling;', parentElement);
    await checkbox.click();

    await sendByCount(driver, 2);
}

async function sendByCount(driver, count) {
    const sendAllPilotsText = ' Select All ';
    const sendAllPilotsLocator = By.xpath(`//*[text()='${sendAllPilotsText}']`);
    const sendAllPilotsButton = await getElementWithWait(driver, sendAllPilotsLocator);
    await sendAllPilotsButton.click();

    const deployText = `Deploy (${count})`;
    const deployLocator = By.xpath(`//*[text()='${deployText}']`);
    const deployElement = await getElementWithWait(driver, deployLocator);
    await deployElement.click();

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
}

async function switchToPopupConfirmAndBack(driver, isSubmit = true, callback) {
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

// todo logging outcome to csv with timestamp
// todo split to multiple functions for better debugging