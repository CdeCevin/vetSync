import { test, expect } from '@playwright/test';

test.describe('Gestión de Citas', () => {

  const Cita = {
    nombre: 'Manchas',
    dia: 21,
    hora: '9:45 AM',
    motivo: 'Testing motivo de la cita',
    notas: 'Testing notas adicionales'
  };

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
    
    // Seleccionar paciente "Manchas" usando Combobox
    await page.click('input[placeholder="Seleccionar paciente..."]');
    await page.fill('input[placeholder="Seleccionar paciente..."]', Cita.nombre);
    // Esperar a que aparezcan las opciones filtradas
    await page.waitForSelector(`text=${Cita.nombre} — Dueño:`, { timeout: 5000 });
    await page.click(`text=${Cita.nombre} — Dueño:`);
    
    // Fecha y hora usando DatePicker
    await page.click('input[placeholder="Seleccionar fecha y hora..."]');
    // Esperar a que se abra el DatePicker
    await page.waitForSelector('.react-datepicker', { timeout: 5000 });
    
    // CORRECCIÓN 2: Se añaden comillas internas a las variables de día y hora
    await page.click(`.react-datepicker__day:has-text("${Cita.dia}"):not(.react-datepicker__day--outside-month)`);
    // Esperar y seleccionar hora
    await page.waitForSelector('.react-datepicker__time-list-item', { timeout: 5000 });
    await page.click(`.react-datepicker__time-list-item:has-text("${Cita.hora}")`);
        
    // Hacer clic en el combobox (el SelectTrigger)
    await page.getByRole('combobox').nth(2).click();
    // Esperar y seleccionar la opción
    await page.waitForSelector('[role="option"]', { timeout: 5000 });
    await page.locator('[role="option"]').filter({ hasText: /^15$/ }).click();
        
    // Motivo
    await page.fill('input[minlength="10"]', Cita.motivo);
    
    // Tipo de cita usando Select
    await page.getByRole('combobox').filter({ hasText: 'Seleccionar...' }).click();
    // Esperar a que se abran las opciones
    await page.waitForSelector('[role="option"]', { timeout: 5000 });
    
    await page.locator('[role="option"]').filter({ hasText: 'Consulta' }).click();
    
    // Notas
    await page.fill('textarea', Cita.notas);
    
    // Guardar la cita
    await page.click('button:has-text("Agendar")');
    
    // Verificar mensaje de éxito
    await expect(page.locator('text=La cita se ha creado exitosamente')).toBeVisible({ timeout: 10000 });
    
    // Verificar que el diálogo se cerró
    await expect(page.locator('text=Crear nueva cita')).not.toBeVisible();
  });
});