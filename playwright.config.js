import { defineConfig } from '@playwright/test';  
  
export default defineConfig({  
  testDir: './Test/playwright',  
  use: {  
    video: 'on',  
    headless: true, // Equivalente a --headed  
  },  
});