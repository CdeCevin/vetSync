import { defineConfig } from '@playwright/test';  
  
export default defineConfig({  
  testDir: './Test/playwright',  
  use: {  
    video: 'on',  
    headless: false, // Equivalente a --headed  
    launchOptions: {
      slowMo: 500, // Retrasa cada acción 500 milisegundos (0.5 segundos)
    },
  },  
});