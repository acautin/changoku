import { defineConfig } from '@playwright/test';
import fs from 'fs';

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const hasSystemChrome = fs.existsSync(chromePath);

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.js',
  timeout: 30000,
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    headless: true,
    launchOptions: hasSystemChrome
      ? { executablePath: chromePath, args: ['--disable-gpu', '--no-sandbox'] }
      : { args: ['--disable-gpu', '--no-sandbox'] }
  }
});
