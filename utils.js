const { until } = require('selenium-webdriver');

const DEFAULT_TIMEOUT = 10000; // 10 seconds

module.exports = {
    getElementWithWait: async function (driver, locator, timeout = DEFAULT_TIMEOUT) {
        // Wait for the element to be present and visible
        await driver.wait(until.elementLocated(locator), timeout);
        await driver.wait(until.elementIsVisible(await driver.findElement(locator)), timeout);

        // Perform actions on the element after it is found and visible
        return driver.findElement(locator);
    }
}