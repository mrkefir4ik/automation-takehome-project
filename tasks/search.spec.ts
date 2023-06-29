import { chromium, Browser, Page } from "playwright";
import * as fs from "fs";

// Get the search term from the command-line argument
const searchTerm = process.argv[1];

// Define URL
const siteUrl = "https://www.amazon.com";

async function scrapeEcommercePrices(siteUrl: string, searchTerm: string) {
  const browser: Browser = await chromium.launch();
  const page: Page = await browser.newPage();

  // Navigate to the e-commerce site
  await page.goto(siteUrl);

  // Search for the provided term
  await page.fill("#twotabsearchtextbox", searchTerm);
  page.click('.nav-search-submit [type="submit"]');

  // Wait for the results to load
  await page.waitForSelector(".s-result-list");

  // Find the products
  const products = await page.evaluate(() => {
    const results = [];

    const productElements = document.querySelectorAll(".s-result-item");
    for (const element of productElements) {
      const nameElement = element.querySelector("h2 a span");
      const priceElement = element.querySelector(".a-price span");
      const linkElement = element.querySelector("h2 a");

      if (nameElement && priceElement && linkElement) {
        const name = nameElement.textContent!.trim();
        const price = priceElement.textContent!.trim();
        const link = linkElement.getAttribute("href") || "No Link";

        results.push({ name, price, searchTerm, link });
      }
    }

    return results;
  });

  await browser.close();

  // Sort the products by price in ascending order
  products.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));

  // Return the three lowest priced products
  return products.slice(0, 3);
}

// Scrape prices and write to CSV
scrapeEcommercePrices(siteUrl, searchTerm)
  .then(() => console.log("CSV file has been written successfully."))
  .catch((error) => console.error("An error occurred:", error));
