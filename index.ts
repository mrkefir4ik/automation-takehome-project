import { chromium, Browser, Page } from "playwright";

import * as fs from "fs";

interface Product {
  name: string;
  price: string;
  searchTerm: string;
  link: string;
}

async function scrapePricesFromPage(
  siteUrl: string,
  searchTerm: string
): Promise<Product[]> {
  const browser: Browser = await chromium.launch();
  const page: Page = await browser.newPage();

  // Navigate to the e-commerce site
  await page.goto(siteUrl);

  // Wait for the search box to be visible and enabled
  await page.waitForSelector("#twotabsearchtextbox", { state: "visible" });

  // Search for the provided term
  await page.fill("#twotabsearchtextbox", searchTerm);

  page.click('.nav-search-submit [type="submit"]');

  // Wait for the results to load
  await page.waitForSelector(".s-product-image-container", {
    state: "visible",
  });

  await page.waitForTimeout(1000);
  // Change the sort by option to "Price: Low to High"
  const sortBySelect = await page.waitForSelector("#s-result-sort-select", {
    state: "visible",
  });
  await sortBySelect.selectOption("price-asc-rank");

  // Wait for the sorted results to load
  await page.waitForSelector(".s-product-image-container", {
    state: "visible",
  });

  await page.waitForTimeout(1000);
  // Find the products
  const products: Product[] = await page.evaluate((searchTerm: string) => {
    const results: Product[] = [];

    const productElements =
      window.document.querySelectorAll(".s-card-container");
    for (const element of productElements) {
      const nameElement = element.querySelector("h2 a span");
      const priceElement = element.querySelector(".a-price .a-offscreen");
      const linkElement = element.querySelector("h2 a");

      if (nameElement && priceElement && linkElement) {
        const name = nameElement.textContent!.trim();
        const price = priceElement.textContent!.trim();
        const link = linkElement.getAttribute("href") || "No Link";

        results.push({ name, price, searchTerm, link });
      }
    }

    return results;
  }, searchTerm);

  await browser.close();

  // Sort the products by price in ascending order
  products.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));

  // Return the three lowest priced products
  return products.slice(0, 3);
}

async function writeProductsToCSV(products: Product[]): Promise<void> {
  const csvRows: string[] = [];
  csvRows.push("Product,Price,Search Term,Product Link");

  products.forEach((product) => {
    const { name, price, searchTerm, link } = product;
    const csvName = name.replace(/"/g, '""');
    const csvRow = `"${csvName}",${price},"${searchTerm}",${link}`;
    csvRows.push(csvRow);
  });

  const csvContent = csvRows.join("\n");
  await fs.promises.writeFile("ecommerce_prices.csv", csvContent);
}

// Get the search term from the command-line argument
const searchTerm = process.argv[2];
console.log(
  "Searching for 3 cheapest items with name: " + process.argv[2].toUpperCase()
);

// Define URL
const siteUrl = "https://www.amazon.com";

async function scrapeWithRetry(
  siteUrl: string,
  searchTerm: string,
  maxRetries: number = 3
): Promise<Product[]> {
  let retryCount = 0;
  while (retryCount < maxRetries) {
    try {
      const products = await scrapePricesFromPage(siteUrl, searchTerm);
      if (products.length < 3)
        throw new Error("Page could not load. Trying again...");
      return products;
    } catch (error) {
      console.error(`Scraping failed (Attempt ${retryCount + 1}):`, error);
      retryCount++;
    }
  }
  throw new Error(`Scraping failed after ${maxRetries} attempts.`);
}

// Usage:
scrapeWithRetry(siteUrl, searchTerm)
  .then((products) => writeProductsToCSV(products))
  .then(() => console.log("CSV file has been written successfully."))
  .catch((error) => console.error("An error occurred:", error));
