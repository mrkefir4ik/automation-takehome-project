//@ts-nocheck
export const chromium = {
  launch: jest.fn().mockResolvedValue({
    newPage: jest.fn().mockResolvedValue({
      goto: jest.fn(),
      waitForSelector: jest.fn(),
      fill: jest.fn(),
      click: jest.fn(),
      selectOption: jest.fn(),
      evaluate: jest.fn(),
      close: jest.fn(),
      waitForTimeout: jest.fn().mockResolvedValue(),
    }),
    close: jest.fn(),
  }),
};

export const Browser = {
  newPage: jest.fn().mockResolvedValue({
    goto: jest.fn(),
    waitForSelector: jest.fn(),
    fill: jest.fn(),
    click: jest.fn(),
    selectOption: jest.fn(),
    evaluate: jest.fn(),
    close: jest.fn(),
    waitForTimeout: jest.fn().mockResolvedValue(),
  }),
};

export const Page = {
  goto: jest.fn(),
  waitForSelector: jest.fn(),
  fill: jest.fn(),
  click: jest.fn(),
  selectOption: jest.fn(),
  evaluate: jest.fn(),
  close: jest.fn(),
  waitForTimeout: jest.fn().mockResolvedValue(),
};
