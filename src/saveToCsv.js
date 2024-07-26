const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const path = "./files/log.csv";

function saveDataToCsv(data) {
    // Create a CSV writer instance
    const csvWriter = createCsvWriter({
        path, // Path to the output CSV file
        header: ["name", "count"],
        append: true
    });

    // Write the data to the CSV file
    return csvWriter.writeRecords(data)
        .then(() => console.log('CSV file has been written successfully.'))
        .catch((error) => console.error('Error writing CSV file:', error));
}

module.exports = {
    saveDataToCsv
}