const fs = require('fs');

const csvPath = process.argv[2] || '/Users/x/Downloads/5_15_24 - Ecom Stores & Leaders - Verified Emails & Signals (50k, 1-100 employees) - Original Data.csv'; // Replace with target CSV location or provide it as an argument to the file when running with node

if (!csvPath) {
    console.error('Please provide a CSV file path as an argument.');
    process.exit(1);
}

function getLeadListName() {
    const splitCsvPath = csvPath.split("/");
    const listName = splitCsvPath[splitCsvPath.length - 1];

    return listName;
}

function csvToObjects(csvString) {
    const lines = csvString.split("\n");
    const headers = lines[0].split(",").map((el) => el.trim());
    const data = lines.slice(1);
    const objects = [];

    for (let i = 0; i < data.length; i++) {
        let row = data[i];
        const values = row.split(",");
        const object = {};

        headers.forEach((header, index) => {
            object[header] = values[index] ? values[index].trim() : values[index];
          });

          objects.push(object);
    }

    return objects;
}

function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf-8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        const arrayOfObjects = csvToObjects(data);
        resolve(arrayOfObjects);
      }
    });
  });
}

function createListsPerContactType(arrayOfLeadObjects) {
    const output = {
        keys: [],
        phoneNumbers: [],
        emails: [],
        linkedIn: [],
        facebook: [],
        twitter: [],
    };

    for (let i = 0; i < arrayOfLeadObjects.length; i++) {
        let lead = arrayOfLeadObjects[i];

        if (i === 0) {
            output.keys = Object.keys(lead);
        }
        if (lead?.phone_number && lead?.country?.includes("United States")) {
            output.phoneNumbers.push(lead);
        }
        if (lead?.personal_email || lead?.email) {
            if (!lead?.email && lead?.personal_email) {
                lead.email = lead.personal_email;
            }
            output.emails.push(lead);
        }
        if (lead?.linkedin_url) {
            output.linkedIn.push(lead);
        }
        if (lead?.organization_twitter_url) {
            output.twitter.push(lead);
        }
        if (lead?.organization_facebook_url) {
            output.facebook.push(lead);
        }
    }

    return output;
}

function writeFile(filename, content) {
    const fs = require("fs");
    fs.writeFileSync(filename, content); // This will write the new lead lists to the same location this file is run
}

function createCSVsPerContactType(outputObject) {
    const keysToProcess = Object.keys(outputObject).filter(key => key !== "keys");

    for (const key of keysToProcess) {
      const data = outputObject[key];

      if (!data.length) continue;
      if (key === "headers") continue;
  
      const headers = Object.keys(data[0]);
  
      const csvString = data.map(obj => headers.map(header => obj[header] || "").join(",")).join("\n");
  
      const filename = `${getLeadListName()} - ${key}-list.csv`;
  
      writeFile(filename, csvString);

      console.log('Created:', filename);
    }
  }

readCSV(csvPath)
    .then(objects => {
        const lists = createListsPerContactType(objects);
        createCSVsPerContactType(lists)
    })
    .catch(error => {
        console.error('Error reading CSV file:', error);
});
