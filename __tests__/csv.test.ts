import { writeProductsToCSV, Product } from "../helpers";
import * as fs from "fs";

jest.mock("fs", () => ({
  promises: {
    writeFile: jest.fn(),
  },
}));

describe("writeProductsToCSV", () => {
  it("should write products to a CSV file", async () => {
    const products: Product[] = [
      {
        name: "Product 1",
        price: "10.99",
        searchTerm: "search term",
        link: "product-link-1",
      },
      {
        name: "Product 2",
        price: "19.99",
        searchTerm: "search term",
        link: "product-link-2",
      },
      {
        name: "Product 3",
        price: "7.99",
        searchTerm: "search term",
        link: "product-link-3",
      },
    ];

    await writeProductsToCSV(products);

    expect(fs.promises.writeFile).toHaveBeenCalledTimes(1);
    expect(fs.promises.writeFile).toHaveBeenCalledWith(
      "ecommerce_prices.csv",
      "Product,Price,Search Term,Product Link\n" +
        '"Product 1",10.99,"search term",product-link-1\n' +
        '"Product 2",19.99,"search term",product-link-2\n' +
        '"Product 3",7.99,"search term",product-link-3'
    );
  });
});
