const fs = require('fs');

const csvPath = '/Users/x/Cervino Enterprises/Lead Lists/Lead Extractor/6-24-24 - restricted category.csv'; // Replace with target CSV location or provide it as an argument to the file when running with node

if (!csvPath) {
    console.error('Please provide a CSV file path as an argument.');
    process.exit(1);
}

function getLeadListName() {
    const splitCsvPath = csvPath.split("/");
    let listName = splitCsvPath[splitCsvPath.length - 1];
    listName = listName.replace(/\.csv$/, '');

    return listName;
}

function validateAndFormatUSPhoneNumber(phoneNumber) {
    if (!phoneNumber) return null;

    // Remove all non-numeric characters except for the leading +
    const cleaned = ('' + phoneNumber).replace(/[^\d]/g, '');

    // Check if the cleaned number starts with 1 and has 11 digits, or if it has 10 digits
    const isValid = (cleaned.length === 11 && cleaned.startsWith('1')) || cleaned.length === 10;

    if (!isValid) {
        return null; // Or you could return an error message
    }

    // If the number starts with 1 and has 11 digits, remove the leading 1 for formatting
    const number = (cleaned.length === 11 && cleaned.startsWith('1')) ? cleaned.substring(1) : cleaned;

    // Reformat to +1 (###) ###-####
    const formatted = '+1 (' + number.substring(0, 3) + ') ' + number.substring(3, 6) + '-' + number.substring(6);

    return formatted;
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

function convertKeysToLowerCase(obj) {
    const newObject = {};
    Object.keys(obj).forEach((key) => {
        const value = obj[key];
        newObject[key.toLowerCase().replace(/\s+/g, '_')] = value;
    });
    return newObject;
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

function formatColumnName(key) {
    let formattedColumnName = key;

    switch(key) {
        case 'first_name':
            formattedColumnName = "First Name";
            break;
        case 'last_name':
            formattedColumnName = "Last Name";
            break;
        case 'name':
            formattedColumnName = "Full Name";
            break;
        case 'email':
            formattedColumnName = "Email";
            break;
        case 'phone_number':
            formattedColumnName = "Phone Number";
            break;
        case "organization_name":
            formattedColumnName = "Company Name";
            break;
        default:
    }

    return formattedColumnName;
}

// Note: Uppercase key names due to renaming for GHL & desired file name formats
function createListsPerContactType(arrayOfLeadObjects) {
    const output = {
        keys: [],
        "US Phone Numbers": [],
        Emails: [],
        LinkedIn: [],
        Facebook: [],
        Twitter: [],
    };

    for (let i = 0; i < arrayOfLeadObjects.length; i++) {
        let lead = convertKeysToLowerCase(arrayOfLeadObjects[i]);
        const leadPhoneNumber = validateAndFormatUSPhoneNumber((lead?.phone_number 
            || lead["Phone Number"] 
            || lead?.organization_phone_number 
            || lead["Oragnization Phone Number"]
        ));

        if (i === 0) {
            output.keys = Object.keys(lead);
        }

        // format data universally
        // NAMES
        if (lead?.name && (!lead?.first_name || !lead?.last_name)) {
            const separatedNames = lead.name.split(" ")

            lead.first_name = separatedNames[0];
            lead.last_name = separatedNames[separatedNames.length - 1];
        }
        if (lead["Name"] && (!lead["First Name"] || !lead["Last Name"])) {
            const separatedNames = lead["Name"].split(" ")

            lead.first_name = separatedNames[0];
            lead.last_name = separatedNames[separatedNames.length - 1];
        }
        // EMAILS
        if (!lead?.email && lead["Email"]) {
            lead.email = lead["Email"];
        } 
        if (!lead?.email && lead?.personal_email) {
            lead.email = lead.personal_email
        }
        if (!lead["Email"] && lead["Personal Email"]) {
            lead.email = lead["Personal Email"]
        }
        // PHONE NUMBER
        if (lead.phone_number || lead["Phone Number"]) { // globally reassign US numbers to formatted number
            if (leadPhoneNumber) {
                lead.phoneNumber = leadPhoneNumber
            };
        }

        // format & assign data per list type
        if (
            leadPhoneNumber && lead?.country?.includes("United States")
            || leadPhoneNumber && lead["Country"]?.includes("United States")
        ) { // if validated US number
            output["US Phone Numbers"].push(lead);
        }
        if (
            lead?.personal_email || lead?.email
        ) {
            output.Emails.push(lead);
        }
        if (lead?.linkedin_url || lead?.linkedin || lead["LinkedIn"]) {
            output.LinkedIn.push(lead);
        }
        if (lead?.organization_twitter_url) {
            output.Twitter.push(lead);
        }
        if (lead?.organization_facebook_url) {
            output.Facebook.push(lead);
        }
    }
    // console.log(
    //     "List",
    //     output["US Phone Numbers"].length,
    //     output.Emails.length,
    //     output.LinkedIn.length,
    //     output.Facebook.length,
    //     output.Twitter.length,
    // )
    return output;
}

function writeFile(filename, content) {
    const fs = require("fs");
    fs.writeFileSync(filename, content); // This will write the new lead lists to the same location this file is run
}

function createCSVsPerContactType(outputObject) {
    const keysToProcess = Object.keys(outputObject).filter(key => key !== "keys");
    const headers = outputObject.keys;
    const formattedHeadersString = outputObject.keys.map(formatColumnName).join(",");

    for (const key of keysToProcess) {
        const data = outputObject[key];

        if (!data.length) continue;
        if (key === "headers") continue;
    
        const csvString = [
            formattedHeadersString, 
            ...data.map(obj => headers.map(header => {
                return obj[header] || "";
            }).join(",")),
        ].join("\n");
    
        const filename = `${key} - ${getLeadListName()}.csv`;
    
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
