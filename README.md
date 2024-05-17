# Instructions On How To Use

Use this to separate large CSV files containing leads into separate lead lists.

**NOTE**: The leads in the CSV should have one if not all of the the following column names: `phone_number`, `country`, `personal_email`, `email`, `linkedin_url`, `organization_twitter_url`, `organization_facebook_url`,

The ouput will be a series of lead lists in the same folder where the `index.js` is executed in with the following names:

1. Phone Number: `{CSV file name} - phoneNumbers-list`
2. Emails: `{CSV file name} - emails-list`
3. LinkedIn: `{CSV file name} - linkedIn-list`
4. Facebook: `{CSV file name} - facebook-list`
5. Twitter: `{CSV file name} - twitter-list`



## How to run the file:

### (1) Edit the location inside the `index.js` file

Simply replace the example path with the desired CSV's path on your computer:

``` Inside index.js:

const csvPath = process.argv[2] || '/Users/x/Downloads/5_15_24 - Ecom Stores & Leaders - Verified Emails & Signals (50k, 1-100 employees) - Original Data.csv'; // Replace what's between the '' here with your desired CSV path location

```


### (2) Supply a file location when running the file

Simply supply the desired CSV's path to the end of the Terminal CLI command:

```
node index.js /path/to/your/csvfile.csv
```