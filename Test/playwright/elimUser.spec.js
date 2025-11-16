import { test, expect } from '@playwright/test';

test.describe('Gestión de Usuarios - Administrador', () => {

  const credenciales = {
    correo: 'admin@vin.com',
    nombre: 'Administrador Testing',
    password: '123456789',
    iniciales: 'AT', 
    rol: 'Administrador' 
  };

  const usuarioAEliminar = {
    iniciales: 'VC',
    nombre: 'Viviana Casas',
    correo: 'vet@two.com',
    rol: 'Veterinario'
  };


  test.beforeEach(async ({ page }) => {
    // Login como administrador
    await page.goto('http://localhost:3000');
    await page.fill('input[type="email"]', credenciales.correo);
    await page.fill('input[type="password"]', credenciales.password);
    await page.click('button:has-text("Ingresar")');

    // Esperar a que cargue el dashboard
    const welcomeRegex = new RegExp(`Bienvenid@, ${credenciales.nombre}`);
    await expect(page.getByRole('heading', { name: welcomeRegex })).toBeVisible();
  });

// TEST 1: Eliminar usuario correctamente
test('Eliminar usuario correctamente', async ({ page }) => {
  await page.click('text=Usuarios');
  await expect(page.locator('h1:has-text("Gestión de Usuarios")')).toBeVisible();
  await page.waitForSelector('text=Lista de Usuarios', { timeout: 5000 });

  // Localizar la tarjeta exacta del usuario usando el patrón completo
  const correoEscapado = usuarioAEliminar.correo.replace(/\./g, '\\.');
  const patternString = `^${usuarioAEliminar.iniciales}${usuarioAEliminar.nombre}${correoEscapado}${usuarioAEliminar.rol}$`;
  const userCard = page.locator('div').filter({
    hasText: new RegExp(patternString)
  }).first();

  // Clic en el botón dentro de esa tarjeta
  await userCard.locator('button').click();

  // Clic en "Eliminar" del menú
  await page.getByRole('menuitem', { name: 'Eliminar' }).click();

  // Verificar modal
  const modal = page.getByRole('dialog', { name: 'Confirmar Eliminación' });
  await expect(modal).toBeVisible();
  await expect(modal.locator(`text=${usuarioAEliminar.nombre}`)).toBeVisible();

  // Confirmar eliminación
  await modal.getByRole('button', { name: 'Eliminar' }).click();

  // Verificar éxito
  await expect(page.locator('text=se ha eliminado')).toBeVisible({ timeout: 10000 });
  await expect(modal).not.toBeVisible();
});

// TEST 2: No permitir eliminar usuario activo
test('No permitir eliminar el usuario activo', async ({ page }) => {
  await page.click('text=Usuarios');
  await expect(page.locator('h1:has-text("Gestión de Usuarios")')).toBeVisible();
  await page.waitForSelector('text=Lista de Usuarios', { timeout: 5000 });

  // Localizar la tarjeta del admin (usando las credenciales)
  const adminCorreoEscapado = credenciales.correo.replace(/\./g, '\\.');
  const adminPatternString = `^${credenciales.iniciales}${credenciales.nombre}${adminCorreoEscapado}${credenciales.rol}$`;
  const adminCard = page.locator('div').filter({
    hasText: new RegExp(adminPatternString)
  }).first();

  // Clic en el botón
  await adminCard.locator('button').click();

  // Clic en "Eliminar"
  await page.getByRole('menuitem', { name: 'Eliminar' }).click();

  // Verificar mensaje de error
  await expect(page.locator('text=No es posible eliminar el usuario activo')).toBeVisible({ timeout: 5000 });
  await expect(page.getByRole('dialog', { name: 'Confirmar Eliminación' })).not.toBeVisible();
});

});