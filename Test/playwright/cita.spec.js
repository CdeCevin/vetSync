import { test, expect } from '@playwright/test';  
  
test.describe('Gestión de Citas', () => {  
  test.beforeEach(async ({ page }) => {  
    // Login primero  
    await page.goto('http://localhost:3000');  
    await page.fill('input[type="email"]', 'Ce@vin.com');  
    await page.fill('input[type="password"]', '12345');  
    await page.click('button:has-text("Ingresar")');  
      
    // Esperar a que cargue el dashboard  
    await expect(page.locator('text=Bienvenid@')).toBeVisible();  
  });  
  
  test('Creación de cita correcta', async ({ page }) => {  
    // Navegar a la sección de Citas  
    await page.click('text=Citas');  
      
    // Verificar que estamos en la página de citas  
    await expect(page.locator('h1:has-text("Gestión de Citas")')).toBeVisible();  
      
    // Abrir el diálogo de nueva cita  
    await page.click('button:has-text("Nueva Cita")');  
      
    // Esperar a que se abra el diálogo  
    await expect(page.locator('text=Crear nueva cita')).toBeVisible();  
      
    // Seleccionar paciente usando Combobox  
    await page.click('input[placeholder="Seleccionar paciente..."]');  
    await page.fill('input[placeholder="Seleccionar paciente..."]', 'Manchas');  
    await page.click('text=Manchas — Dueño:');  
      
    // Seleccionar veterinario (si no está deshabilitado)  
    const vetInput = page.locator('input[placeholder*="veterinario"]');  
    const isDisabled = await vetInput.isDisabled();  
    if (!isDisabled) {  
      await vetInput.click();  
      await vetInput.fill('');  
      await page.click('div[class*="cursor-pointer"]').first();  
    }  
      
    // Fecha y hora usando DatePicker  
    await page.click('input[placeholder="Seleccionar fecha y hora..."]');  
    // Navegar al mes correcto si es necesario  
    await page.click('text=11'); // Seleccionar día 11  
    await page.click('text=1:45 PM'); // Seleccionar hora  
      
    // Duración usando Select  
    await page.click('button:has-text("Duración")').first();  
    await page.click('text=15').first();  
      
    // Motivo  
    await page.fill('input[minlength="10"]', 'Testing motivo de la cita');  
      
    // Tipo de cita usando Select  
    await page.locator('button').filter({ hasText: 'Tipo de cita' }).click();  
    await page.click('text=Consulta');  
      
    // Notas  
    await page.fill('textarea', 'Testing notas adicionales');  
      
    // Guardar la cita  
    await page.click('button:has-text("Agendar")');  
      
    // Verificar mensaje de éxito  
    await expect(page.locator('text=La cita se ha creado exitosamente')).toBeVisible();  
      
    // Verificar que el diálogo se cerró  
    await expect(page.locator('text=Crear nueva cita')).not.toBeVisible();  
  });  
});