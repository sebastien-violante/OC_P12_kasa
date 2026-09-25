import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const config: Config = {
  testEnvironment: "jsdom",

  setupFiles: ["<rootDir>/jest.env.ts"],

  setupFilesAfterEnv: ["<rootDir>/jest.setup.tsx"],

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};

export default createJestConfig(config);