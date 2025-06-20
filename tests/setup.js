// Jest setup file for X Reply Assistant tests

// Mock Chrome APIs
global.chrome = {
  runtime: {
    sendMessage: jest.fn(() => Promise.resolve({ success: true })),
    onMessage: {
      addListener: jest.fn(),
    },
  },
  storage: {
    local: {
      get: jest.fn(() => Promise.resolve({})),
      set: jest.fn(() => Promise.resolve()),
    },
    secure: {
      get: jest.fn(() => Promise.resolve({})),
      set: jest.fn(() => Promise.resolve()),
    },
  },
  tabs: {
    create: jest.fn(),
    query: jest.fn(() => Promise.resolve([{ url: "https://x.com" }])),
  },
};

// Mock DOM APIs
global.MutationObserver = class MutationObserver {
  constructor(callback) {
    this.callback = callback;
  }

  observe() {
    // Mock observe
  }

  disconnect() {
    // Mock disconnect
  }
};

// Mock fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        choices: [
          {
            message: {
              content: "Mock AI response",
            },
          },
        ],
      }),
  })
);

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve()),
  },
});

// Mock console methods for cleaner test output
const originalConsole = { ...console };
beforeEach(() => {
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterEach(() => {
  Object.assign(console, originalConsole);
});

// Global test utilities
global.testUtils = {
  createMockTweet: (text = "Test tweet content") => ({
    querySelector: jest.fn((selector) => {
      if (selector === '[data-testid="tweetText"]') {
        return { textContent: text };
      }
      if (selector === '[role="group"]') {
        return {
          parentNode: {
            insertBefore: jest.fn(),
          },
        };
      }
      return null;
    }),
    setAttribute: jest.fn(),
    textContent: text,
  }),

  createMockModal: () => ({
    remove: jest.fn(),
    querySelector: jest.fn(),
    style: { display: "none" },
  }),

  waitFor: (condition, timeout = 1000) => {
    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        if (condition()) {
          clearInterval(interval);
          resolve();
        }
      }, 100);

      setTimeout(() => {
        clearInterval(interval);
        reject(new Error("Timeout waiting for condition"));
      }, timeout);
    });
  },
};

// Setup DOM environment
import { JSDOM } from "jsdom";

const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
  url: "https://x.com",
  pretendToBeVisual: true,
  resources: "usable",
});

global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
