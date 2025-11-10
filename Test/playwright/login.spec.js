import { test, expect } from '@playwright/test';  
  
test.describe('Autenticación VetSync', () => {  
  test('Iniciar sesión correcto', async ({ page }) => {  
    await page.goto('http://localhost:3000');  
      
    // Llenar formulario de login  
    await page.fill('input[type="email"]', 'Ce@vin.com');  
    await page.fill('input[type="password"]', '12345');  
      
    // Click en botón Ingresar  
    await page.click('button:has-text("Ingresar")');  
      
    // Verificar que se muestra el dashboard  
    await expect(page.locator('text=Bienvenid@')).toBeVisible();  
    await expect(page.locator('text=Panel Principal -')).toBeVisible();  
  });  
  
  test('Iniciar sesión incorrecto', async ({ page }) => {  
    await page.goto('http://localhost:3000');  
      
    // Llenar con credenciales incorrectas  
    await page.fill('input[type="email"]', 'usuario');  
    await page.fill('input[type="password"]', 'contraseña');  
      
    // Click en botón Ingresar  
    await page.click('button:has-text("Ingresar")');  
      
    // Verificar mensaje de error  
    await expect(page.locator('text=Credenciales inválidas')).toBeVisible();  
  });  
});