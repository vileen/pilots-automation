const { By } = require("selenium-webdriver");
const { getElementWithWait } = require("./utils");

async function countResults(driver, counts) {
    for (const group of counts) {
        group.count += await countGroup(driver, group.name);
    }
}

async function countGroup(driver, group) {
    try {
        const outcomesText = ' Outcomes '; // The text you are looking for
        const outcomesLocator = By.xpath(`//*[text()='${outcomesText}']/following-sibling::*[1]`); // The text you are looking for
        const outcomesElement = await getElementWithWait(driver, outcomesLocator);

        const groupText = `${group}`; // The text you are looking for
        const groupLocator = By.xpath(`//*[text()='${groupText}']`);
        const elements = await outcomesElement.findElements(groupLocator);

        let count = 0;
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            const elementText = await element.getText();
            if (elementText === group) {
                count++;
            }
        }

        return count;
    } catch(err) {
        return 0;
    }
}

module.exports = {
    countResults
}