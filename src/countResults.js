const { findElementByText } = require("./newUtils");

async function countResults(page, counts) {
    for (const group of counts) {
        group.count += await countGroup(page, group.name);
    }
}

async function countGroup(page, group) {
    try {
        const outcomes = await findElementByText(page, " Outcomes ");
        const outcomesElement = await page.evaluateHandle(element => {
            return element.nextElementSibling;
        }, outcomes);

        const matchingTexts = await page.evaluate((parent, text) => {
            const matchingElements = [];

            const elements = parent.querySelectorAll('*');
            for (const element of elements) {
                if (element.textContent.trim() === text) {
                    matchingElements.push(element);
                }
            }
            return matchingElements;
        }, outcomesElement, group);

        return matchingTexts.length;
    } catch(err) {
        return 0;
    }
}

module.exports = {
    countResults
}