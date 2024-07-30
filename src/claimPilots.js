const { findElementByText, findElementByTextAndClick, switchToPopupConfirmAndBack, switchToTab, takeScreenshot, navigateBackHome,
    sleep
} = require("./newUtils");
const { countResults } = require("./countResults");

async function claimPilots(browser, page) {
    try {
        console.log("retrieving pilots");

        await findElementByTextAndClick(page, "Operators Hub");

        await switchToTab(browser, page, "Rebels");
        await getAllPilotsFromTab(browser, page);

        await switchToTab(browser, page, "Enforcers");
        await getAllPilotsFromTab(browser, page, counts);
    } catch(err) {
        await takeScreenshot(page, `./files/errors/claim-error-${new Date().toISOString()}.png`);
        console.error(err);
    } finally {
        await navigateBackHome(browser, page);
    }

    return counts;
}

async function getAllPilotsFromTab(browser, page) {
    if (process.env.ENVIRONMENT !== "development") {
        try {
            const unselectsAllElements = await findElementByText(page, ' Unselect All ', undefined, true);
            if (unselectsAllElements.length === 2) {
                console.log("all pilots are already claimed for this tab");
                return;
            }
        } catch(err) {
        }
    }

    try {
        const pilotsStatus = await findElementByText(page, "Pilots Status");
        const parent = await page.evaluateHandle(el => el.parentElement.parentElement, pilotsStatus);
        const selectAllButton = await page.evaluateHandle((parent, text) => {
            const elements = parent.querySelectorAll('*');
            for (const element of elements) {
                if (element.textContent.trim() === text) {
                    return element;
                }
            }
            return null;
        }, parent, 'Select All');
        if (!selectAllButton) {
            await takeScreenshot(page, `./files/errors/claim-select-all-error-${new Date().toISOString()}.png`);
            console.error("Select All button not found");
            return;
        }
        await page.evaluate(element => element.click(), selectAllButton);

        // todo add check if this button is not disabled
        await findElementByTextAndClick(page, 'Claim', undefined, undefined, true);

        const claimPilotsCheck = async () => {
            console.log("confirmed, will wait for clam pilots modal");
            await findElementByText(page, ' Claim Pilots ', 60000 * 5);
            console.log("modal found");
        }

        await switchToPopupConfirmAndBack(browser, page, false, claimPilotsCheck);

        await countResults(page, counts);

        await sleep(3000);

        const claimPilotsElement = await findElementByText(page, " Claim Pilots ", 60000 * 3);
        await page.evaluate(element => element.click(), claimPilotsElement);

        const pilotsClaimedMessageCheck = async () => {
            console.log("waiting for pilots claimed message");
            await findElementByText(page, 'Pilots Claimed', 60000*5);
        }

        await sleep(2000);

        await switchToPopupConfirmAndBack(browser, page, false, pilotsClaimedMessageCheck);

        await sleep(2000);

        console.log("waiting for ok button");
        await findElementByTextAndClick(page, 'OK', 60000 * 3);
    } catch(err) {
        await takeScreenshot(page, `./files/errors/claim-from-tab-error-${new Date().toISOString()}.png`);
        console.error(err);
    }
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