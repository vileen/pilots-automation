const { navigateBackHome, switchToEnforcersTab, getElementsWithWait, getElementWithWait, switchToPopupConfirmAndBack, findElementByTextAndClick,
    takeScreenshot
} = require("./utils");
const { By, until } = require("selenium-webdriver");
const { countResults } = require("./countResults");

async function claimPilots(driver) {
    try {
        console.log("retrieving pilots");

        const opsHubText = 'Operators Hub'; // The text you are looking for
        const opsHubLocator = By.xpath(`//*[text()='${opsHubText}']`);
        const opsHubElement = await getElementWithWait(driver, opsHubLocator);
        const opsHubContainer = await opsHubElement.findElement(By.xpath('..'))
        const opsHubTile = await opsHubContainer.findElement(By.xpath('..'))
        await opsHubTile.click();

        await getAllPilotsFromTab(driver);
        await switchToEnforcersTab(driver);
        await getAllPilotsFromTab(driver, counts);
    } catch(err) {
        await takeScreenshot(driver, `./files/errors/claim-error-${new Date().toISOString()}.png`);
        console.error(err);
    } finally {
        await navigateBackHome(driver);
    }

    return counts;
}

async function getAllPilotsFromTab(driver) {
    try {
        try {
            const unselectAllText = ' Unselect All '; // The text you are looking for
            const unselectAllLocator = By.xpath(`//*[text()='${unselectAllText}']`);
            const unselectAllElements = await getElementsWithWait(driver, unselectAllLocator);
            if (unselectAllElements.length === 2) {
                console.log("all pilots are already claimed for this tab");
                return;
            }
        } catch(err) {
        }

        // todo add check if select all is there but on the right panel
        await waitForPilotsToBeClaimable(driver);

        const selectAllText = ' Select All '; // The text you are looking for
        const selectAllLocator = By.xpath(`//*[text()='${selectAllText}']`);
        const selectAllElements = await getElementsWithWait(driver, selectAllLocator);

        // one group of pilots could be already retrieved so Select All would be 1st element to send pilots to mission
        const selectElement = selectAllElements.length === 2 ? selectAllElements[1] : selectAllElements[0];
        await selectElement.click();

        // todo add check if this button is not disabled
        await findElementByTextAndClick(driver, 'Claim'); // to się klika, tylko nie pojawia się popup?

        const claimPilotsText = ' Claim Pilots ';
        const claimPilotsLocator = By.xpath(`//*[text()='${claimPilotsText}']`);

        const claimPilotsCheck = async () => {
            console.log("confirmed, will wait for clam pilots modal");
            await getElementWithWait(driver, claimPilotsLocator, 60000 * 3);
            console.log("modal found");
        }

        await takeScreenshot(driver, `./files/errors/debugging-3-${new Date().toISOString()}.png`);
        console.log("will confirm claim")
        await switchToPopupConfirmAndBack(driver, false, claimPilotsCheck, true);

        console.log("before try catch");
        try {
            // Define the text of the element you are looking for
            const textToFind = 'Rolling the outcome for all selected pilots';
            const textToFindLocator = By.xpath(`//*[text()='${textToFind}']`);
            const textToFindElement = await getElementWithWait(driver, textToFindLocator);

            console.log("found text");
            await takeScreenshot(driver, `./files/errors/debugging-1-${new Date().toISOString()}.png`);

            // Define the locator for the element using XPath

            // Wait for the element to be located initially
            await driver.wait(until.elementLocated(textToFindElement), 10000);

            // Custom wait condition to check if the element is removed
            await driver.wait(async () => {
                try {
                    await driver.findElement(textToFindElement);
                    return false; // Element is still present
                } catch (error) {
                    if (error.name === 'NoSuchElementError') {
                        return true; // Element is not found
                    }
                    throw error; // Rethrow if a different error occurred
                }
            }, 60000 * 3);
        } catch(err) {
            console.log("error");
            await takeScreenshot(driver, `./files/errors/debugging-2-${new Date().toISOString()}.png`);
        }

        await countResults(driver, counts);

        const claimPilotsElement = await getElementWithWait(driver, claimPilotsLocator, 60000 * 3);
        await claimPilotsElement.click();

        const pilotsClaimedText = 'Pilots Claimed';
        const pilotsClaimedLocator = By.xpath(`//*[text()='${pilotsClaimedText}']`);

        const pilotsClaimedMessageCheck = async () => {
            console.log("waiting for pilots claimed message");
            await getElementWithWait(driver, pilotsClaimedLocator, 60000 * 3);
        }

        await switchToPopupConfirmAndBack(driver, false, pilotsClaimedMessageCheck);

        console.log("waiting for ok button");
        await findElementByTextAndClick(driver, 'OK', 60000 * 2);
    } catch(err) {
        await takeScreenshot(driver, `./files/errors/claim-from-tab-error-${new Date().toISOString()}.png`);
        console.error(err);
    }
}

const waitForPilotsToBeClaimable = async (driver) => {
    // add driver wait for " Select All " button to be visible
    const selectAllText = ' Select All '; // The text you are looking for
    const selectAllLocator = By.xpath(`//*[text()='${selectAllText}']`);
    await getElementWithWait(driver, selectAllLocator, 60000);
}

const counts = [
    {
        name: "Killed",
        count: 0
    },
    {
        name: "Captured",
        count: 0
    },
    {
        name: "Fumbled",
        count: 0
    },
    {
        name: "Expected",
        count: 0
    },
    {
        name: "X2",
        count: 0
    },
    {
        name: "X5",
        count: 0
    },
    {
        name: "X10",
        count: 0
    }
];

module.exports = {
    claimPilots
}