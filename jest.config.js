module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testMatch: ["**/src/test/**/*.test.ts", "**/src/test/**/*.test.tsx"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
};
