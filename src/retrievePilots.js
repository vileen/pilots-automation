const { switchToEnforcersTab, getElementsWithWait, getElementWithWait, switchToPopupConfirmAndBack, changeUrl } = require("./utils");
const { By } = require("selenium-webdriver");
const { countResults } = require("./countResults");

async function retrievePilots(driver) {
    console.log("retrieving pilots");

    await changeUrl(driver, 'https://v2.taiyopilots.com/pve/operators');

    await getAllPilotsFromTab(driver);
    await switchToEnforcersTab(driver);
    await getAllPilotsFromTab(driver, counts);

    return counts;
}

async function getAllPilotsFromTab(driver) {
    const selectAllText = ' Select All '; // The text you are looking for
    const selectAllLocator = By.xpath(`//*[text()='${selectAllText}']`);
    const selectAllElements = await getElementsWithWait(driver, selectAllLocator);

    // one group of pilots could be already retrieved so Select All would be 1st element to send pilots to mission
    const selectElement = selectAllElements.length === 2 ? selectAllElements[1] : selectAllElements[0];
    await selectElement.click();

    const claimText = 'Claim';
    const claimLocator = By.xpath(`//*[text()='${claimText}']`);
    const claimElement = await getElementWithWait(driver, claimLocator);
    await claimElement.click();

    const claimPilotsText = ' Claim Pilots ';
    const claimPilotsLocator = By.xpath(`//*[text()='${claimPilotsText}']`);

    const claimPilotsCheck = async () => {
        await getElementWithWait(driver, claimPilotsLocator, 60000);
    }

    await switchToPopupConfirmAndBack(driver, false, claimPilotsCheck);

    await countResults(driver, counts);

    const claimPilotsElement = await getElementWithWait(driver, claimPilotsLocator, 60000);
    await claimPilotsElement.click();

    const pilotsClaimedText = 'Pilots Claimed';
    const pilotsClaimedLocator = By.xpath(`//*[text()='${pilotsClaimedText}']`);

    const pilotsClaimedMessageCheck = async () => {
        await getElementWithWait(driver, pilotsClaimedLocator, 60000);
    }

    await switchToPopupConfirmAndBack(driver, false, pilotsClaimedMessageCheck);

    const okText = 'OK';
    const okLocator = By.xpath(`//*[text()='${okText}']`);
    const okElement = await getElementWithWait(driver, okLocator);
    await okElement.click();
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
    retrievePilots
}