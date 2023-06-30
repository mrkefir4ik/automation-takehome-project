//@ts-nocheck
import { scrapePricesFromPage, Product } from "./../helpers";
import { chromium } from "playwright";

jest.mock("playwright");

describe("scrapePricesFromPage", () => {
  let browser: any;
  let page: any;

  beforeAll(async () => {
    browser = await chromium.launch();
  });

  beforeEach(async () => {
    page = await browser.newPage();
  });

  afterEach(async () => {
    await page.close();
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await browser.close();
  });

  it("should scrape prices from a page", async () => {
    const siteUrl = "example.com";
    const searchTerm = "laptop";

    const mockedGoto = jest.fn().mockResolvedValue();
    const mockedWaitForSelector = jest.fn().mockResolvedValue();
    const mockedFill = jest.fn().mockResolvedValue();
    const mockedClick = jest.fn().mockResolvedValue();
    const mockedSelectOption = jest.fn().mockResolvedValue();
    const mockedEvaluate = jest
      .fn()
      .mockImplementation((callback) => callback(searchTerm));

    jest.spyOn(page, "goto").mockImplementation(mockedGoto);
    jest
      .spyOn(page, "waitForSelector")
      .mockImplementation(mockedWaitForSelector);
    jest.spyOn(page, "fill").mockImplementation(mockedFill);
    jest.spyOn(page, "click").mockImplementation(mockedClick);
    jest.spyOn(page, "selectOption").mockImplementation(mockedSelectOption);
    jest.spyOn(page, "evaluate").mockImplementation(mockedEvaluate);

    const selectOptionMock = jest.fn().mockResolvedValue();
    const elementHandleMock = {
      selectOption: selectOptionMock,
    };
    jest.spyOn(page, "waitForSelector").mockResolvedValue(elementHandleMock);

    const expectedProducts: Product[] = [
      {
        name: "Product 1",
        price: "10.99",
        searchTerm: "laptop",
        link: "product-link-1",
      },
      {
        name: "Product 2",
        price: "19.99",
        searchTerm: "laptop",
        link: "product-link-2",
      },
      {
        name: "Product 3",
        price: "7.99",
        searchTerm: "laptop",
        link: "product-link-3",
      },
    ];

    mockedEvaluate.mockResolvedValueOnce(expectedProducts);

    const products = await scrapePricesFromPage(siteUrl, searchTerm);

    expect(page.goto).toHaveBeenCalledTimes(1);
    expect(page.goto).toHaveBeenCalledWith(siteUrl);

    expect(page.waitForSelector).toHaveBeenCalledTimes(4);
    expect(page.waitForSelector).toHaveBeenNthCalledWith(
      1,
      "#twotabsearchtextbox",
      { state: "visible" }
    );
    expect(page.waitForSelector).toHaveBeenNthCalledWith(
      2,
      ".s-product-image-container",
      { state: "visible" }
    );

    expect(page.fill).toHaveBeenCalledTimes(1);
    expect(page.fill).toHaveBeenCalledWith("#twotabsearchtextbox", searchTerm);

    expect(page.click).toHaveBeenCalledTimes(1);
    expect(page.click).toHaveBeenCalledWith(
      '.nav-search-submit [type="submit"]'
    );

    expect(page.evaluate).toHaveBeenCalledTimes(1);
    expect(page.evaluate).toHaveBeenCalledWith(expect.anything(), "laptop");

    expect(products).toEqual(expectedProducts);
  });
});
