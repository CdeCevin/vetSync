import { test, expect } from '@playwright/test';  
  
test.describe('Gestión de Citas - Veterinario', () => {  

  const credenciales = {
    correo: 'Ce@vin.com',
    password: '12345',
  };

  test.beforeEach(async ({ page }) => {  
    // Login como veterinario  
    await page.goto('http://localhost:3000');  
    await page.fill('input[type="email"]', credenciales.correo); // Credenciales de veterinario  
    await page.fill('input[type="password"]', credenciales.password);  
    await page.click('button:has-text("Ingresar")');  
      
    // Esperar a que cargue el dashboard  
    await expect(page.locator('text=Bienvenid@')).toBeVisible();  
  });  
  
  test('Completar todas las citas de hoy', async ({ page }) => {  
  // Navegar a la sección de Citas  
  await page.click('text=Citas');  
    
  // Verificar que estamos en la página de citas  
  await expect(page.locator('h1:has-text("Gestión de Citas")')).toBeVisible();  
    
  // Esperar a que carguen las citas  
  await page.waitForTimeout(2000);  
    
  // Asegurarse de estar en la vista "Día"  
  await page.getByRole('tab', { name: 'Día' }).click();  
    
  // Obtener todas las tarjetas de citas del día  
  const citaCards = page.locator('[class*="hover:shadow-md"]');  
  const count = await citaCards.count();  
    
  console.log(`Encontradas ${count} citas para hoy`);  
    
  // Iterar sobre cada cita y cambiar su estado a "completada"  
  for (let i = 0; i < count; i++) {  
    const card = citaCards.nth(i);  
      
    // Verificar si la cita está en estado "programada"  
    const selectTrigger = card.locator('button[class*="w-\\[150px\\]"]');  
    const currentState = await selectTrigger.textContent();  
      
    if (currentState?.toLowerCase().includes('programada')) {  
      // Hacer clic en el select de estado  
      await selectTrigger.click();  
        
      // Esperar a que se abran las opciones  
      await page.waitForSelector('[role="option"]', { timeout: 3000 });  
        
      // Seleccionar "Completada"  
      await page.getByRole('option', { name: 'Completada' }).click();  
        
      // IMPORTANTE: Esperar a que aparezca el modal de éxito y cerrarlo  
      await expect(page.locator('text=Éxito')).toBeVisible({ timeout: 5000 });  
      await page.getByRole('button', { name: 'Entendido' }).click();  
        
      // Esperar a que el modal se cierre completamente  
      await expect(page.locator('text=Éxito')).not.toBeVisible();  
        
      // Pequeña pausa para que se actualice la UI  
      await page.waitForTimeout(500);  
        
      console.log(`Cita ${i + 1} marcada como completada`);  
    } else {  
      console.log(`Cita ${i + 1} ya está en estado: ${currentState}`);  
    }  
  }  
    
  console.log('Todas las citas programadas han sido completadas');  
});
});