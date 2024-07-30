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
    reconnect,
}