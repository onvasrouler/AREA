import type { Config } from "jest";

const config: Config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/setupTests.js"],
  transform: {
    "^.+\\.(ts|tsx|js|jsx)$": ["babel-jest", { configFile: "./babel.config.cjs" }],
  },
  transformIgnorePatterns: [
    "node_modules/(?!(ansi-regex|strip-ansi|string-width)/)"
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  moduleDirectories: ["node_modules", "<rootDir>/node_modules"],
  moduleFileExtensions: ["js", "jsx", "ts", "tsx"],
  roots: ["<rootDir>/src"],
};

export default config;