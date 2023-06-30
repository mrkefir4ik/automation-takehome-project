import { scrapeWithRetry, writeProductsToCSV } from "./helpers";

// Get the search term from the CLI argument
const searchTerm = process.argv[2];
console.log(
  "Searching for 3 cheapest items with name: " + process.argv[2].toUpperCase()
);

// Define URL
const siteUrl = "https://www.amazon.com";
scrapeWithRetry(siteUrl, searchTerm)
  .then((products) => writeProductsToCSV(products))
  .then(() => console.log("CSV file has been written successfully."))
  .catch((error) => console.error("An error occurred:", error));
