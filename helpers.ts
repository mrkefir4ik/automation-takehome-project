import { chromium, Browser, Page } from "playwright";

import * as fs from "fs";

export interface Product {
  name: string;
  price: string;
  searchTerm: string;
  link: string;
}

export async function scrapePricesFromPage(
  siteUrl: string,
  searchTerm: string
): Promise<Product[]> {
  const browser: Browser = await chromium.launch();
  const page: Page = await browser.newPage();

  await page.goto(siteUrl);

  // Wait for the search box to be visible and enabled
  await page.waitForSelector("#twotabsearchtextbox", { state: "visible" });

  // Search for the provided keyword
  await page.fill("#twotabsearchtextbox", searchTerm);

  page.click('.nav-search-submit [type="submit"]');

  // Wait for the results to load
  await page.waitForSelector(".s-product-image-container", {
    state: "visible",
  });
  // Wait for all the content to load
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

  // Gather the products
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

  // Sort the products by price from low to high
  products.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));

  // Return the three lowest priced products
  return products.slice(0, 3);
}

export async function writeProductsToCSV(products: Product[]): Promise<void> {
  const csvRows: string[] = [];
  csvRows.push("Product,Price,Search Term,Product Link");

  products.forEach((product) => {
    const { name, price, searchTerm, link } = product;
    const csvName = name.replace(/"/g, '""');
    const csvRow = `"${csvName}",${price},"${searchTerm}",${link}`;
    csvRows.push(csvRow);
  });

  //Separate products
  const csvContent = csvRows.join("\n");

  //Write to file
  await fs.promises.writeFile("ecommerce_prices.csv", csvContent);
}

//Sometimes playwright fails to load the page's content. In this case we try again
export async function scrapeWithRetry(
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
