import { test, expect } from '@playwright/test';
import {
  mockExchange,
  login,
  fillProfile,
  onboard,
  details,
  select,
  createOperation,
} from './helpers';
test.beforeEach(async ({ page }) => {
  await mockExchange(page);
});
test('credenciales y validación de login', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-ready="true"]').waitFor();
  await page.getByLabel('Correo electrónico', { exact: true }).fill('correo-invalido');
  await page.getByLabel('Contraseña', { exact: true }).fill('incorrecta');
  await expect(
    page.getByText('Ingresa un correo electrónico válido', { exact: true }),
  ).toBeVisible();
  await page.getByLabel('Correo electrónico', { exact: true }).fill('demo@kambista.com');
  await page.getByRole('button', { name: 'INICIA SESIÓN', exact: true }).click();
  await expect(page.getByText('El correo o la contraseña no son correctos.')).toBeVisible();
  await expect(page.getByLabel('Contraseña', { exact: true })).toHaveValue('incorrecta');
  await page.getByLabel('Contraseña', { exact: true }).fill('');
  await page.getByLabel('Contraseña', { exact: true }).blur();
  await expect(page.getByText('Ingresa tu contraseña', { exact: true })).toBeVisible();
});
test('valida perfil, consentimiento y contenido legal independiente', async ({ page }) => {
  await login(page);
  await page.getByLabel('Nombres completos', { exact: true }).fill('María123');
  await expect(page.getByText('Usa solo letras y espacios')).toBeVisible();
  await page.getByLabel('N° de documento', { exact: true }).fill('123');
  await expect(
    page.getByText('El documento no coincide con el formato seleccionado'),
  ).toBeVisible();
  await select(page, 'Documento', 'CE');
  await page.getByLabel('N° de documento', { exact: true }).fill('123456789');
  await expect(
    page.getByText('El documento no coincide con el formato seleccionado'),
  ).not.toBeVisible();
  await select(page, 'Documento', 'Pasaporte');
  await page.getByLabel('N° de documento', { exact: true }).fill('AB123456');
  await select(page, 'Documento', 'DNI');
  await fillProfile(page);
  await page.getByLabel('Celular', { exact: true }).fill('123');
  await expect(page.getByText('Ingresa un celular de 9 dígitos')).toBeVisible();
  await page.getByLabel('Celular', { exact: true }).fill('987654321');
  await page.getByLabel('Fecha de nacimiento', { exact: true }).fill('2020-01-01');
  await expect(page.getByText('Ingresa una fecha válida; debes ser mayor de edad')).toBeVisible();
  await page.getByLabel('Fecha de nacimiento', { exact: true }).fill('1990-06-15');
  await page.getByRole('checkbox').first().uncheck();
  await page.getByRole('button', { name: 'CONTINUAR', exact: true }).click();
  await expect(page.getByText('Acepta los términos para continuar')).toBeVisible();
  await page.getByRole('link', { name: 'Términos y condiciones', exact: true }).click();
  const legalDialog = page.getByRole('dialog', { name: 'Términos y condiciones', exact: true });
  await expect(legalDialog).toBeVisible();
  const openingAnimations = await legalDialog.evaluate((element) =>
    element.getAnimations().map((animation) => (animation as CSSAnimation).animationName),
  );
  expect(openingAnimations).toContain('ui-modal-enter');
  await page.keyboard.press('Escape');
  await expect(legalDialog).toHaveClass(/ui-dialog--closing/);
  const closingAnimations = await legalDialog.evaluate((element) =>
    element.getAnimations().map((animation) => (animation as CSSAnimation).animationName),
  );
  expect(closingAnimations).toContain('ui-modal-exit');
  await expect(page.getByRole('checkbox').first()).not.toBeChecked();
  await page
    .getByRole('link', {
      name: 'Política de Tratamiento de datos personales de Kambista',
      exact: true,
    })
    .click();
  await expect(
    page.getByText('El consentimiento de esta casilla es opcional', {
      exact: false,
    }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'ENTENDIDO', exact: true }).click();
  await page.getByRole('checkbox').first().check();
  await expect(page.getByRole('checkbox').nth(1)).not.toBeChecked();
  await page.getByRole('button', { name: 'CONTINUAR', exact: true }).click();
  await expect(page.getByRole('heading', { name: /¡Felicitaciones María/ })).toBeVisible();
});
for (const kind of ['DNI', 'PHONE'] as const)
  test('rechazo de registro ' + kind, async ({ page }) => {
    await login(page);
    await fillProfile(page, kind === 'DNI' ? { document: '12345678' } : { phone: '999999999' });
    await page.getByRole('button', { name: 'CONTINUAR', exact: true }).click();
    await expect(
      page.getByRole('heading', {
        name: kind === 'DNI' ? 'DNI en uso' : 'Celular inválido',
      }),
    ).toBeVisible();
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await page.getByRole('button', { name: 'Cerrar notificación', exact: true }).click();
    await expect(page).toHaveURL(/\/registro$/);
  });
test('selectores, inversión, tabs, ahorro cero y cancelaciones', async ({ page }) => {
  await onboard(page);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.getByLabel('¿Cuánto envías?', { exact: true }).fill('100');
  await expect(page.getByTestId('received')).toHaveText('342.80');
  await expect(page.getByTestId('savings')).toContainText('5.14');
  await select(page, 'Moneda que envías', 'Soles');
  await expect(page.getByTestId('received')).toHaveText('28.84');
  await expect(page.getByRole('button', { name: 'Moneda que recibes', exact: true })).toContainText(
    'Dólares',
  );
  await select(page, 'Moneda que recibes', 'Soles');
  await expect(page.getByTestId('received')).toHaveText('342.80');
  await page.getByRole('button', { name: 'Invertir monedas', exact: true }).click();
  await expect(page.getByTestId('received')).toHaveText('28.84');
  for (let i = 0; i < 4; i++) {
    await page.getByRole('button', { name: /^Compra:/ }).click();
    await page.getByRole('button', { name: /^Venta:/ }).click();
  }
  await expect(page.getByTestId('received')).toHaveText('28.84');
  await page.route('**/v1/exchange/calculates?**', (route) =>
    route.fulfill({
      json: { rate: 3.467, exchange: 0, savings: { amount: '0' } },
    }),
  );
  await page.getByLabel('¿Cuánto envías?', { exact: true }).fill('101');
  await expect(page.getByTestId('received')).toHaveText('0.00');
  await expect(page.getByTestId('savings')).toContainText('0.00');
  expect(errors).toEqual([]);
});
test('error de cálculo, reintento y monto inválido', async ({ page }) => {
  await onboard(page);
  await page.route('**/v1/exchange/calculates?**', (route) =>
    route.fulfill({
      status: 502,
      json: { message: 'Servicio temporalmente no disponible' },
    }),
  );
  await page.getByLabel('¿Cuánto envías?', { exact: true }).fill('99');
  await expect(page.getByRole('alert')).toContainText('Servicio temporalmente no disponible');
  await expect(page.getByRole('button', { name: 'INICIAR OPERACIÓN', exact: true })).toBeDisabled();
  await page.unroute('**/v1/exchange/calculates?**');
  await mockExchange(page);
  await page.getByRole('button', { name: 'Reintentar', exact: true }).click();
  await expect(page.getByRole('button', { name: 'INICIAR OPERACIÓN', exact: true })).toBeEnabled();
  await page.getByLabel('¿Cuánto envías?', { exact: true }).fill('0');
  await expect(page.getByRole('button', { name: 'INICIAR OPERACIÓN', exact: true })).toBeDisabled();
});
test('cuenta inválida, creación, persistencia y selección', async ({ page }) => {
  await onboard(page);
  await details(page);
  await page.getByRole('button', { name: 'CONTINUAR', exact: true }).click();
  await expect(
    page.getByText('Selecciona la cuenta donde recibirás el dinero', {
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole('button', {
      name: '¿En qué cuenta deseas recibir tu dinero?',
      exact: true,
    })
    .click();
  await expect(page.getByText('Aún no tienes cuentas en soles.')).toBeVisible();
  await page.getByRole('button', { name: 'Agregar cuenta', exact: true }).click();
  await page.getByLabel('Número de cuenta', { exact: true }).fill('00-ab');
  await page.getByRole('button', { name: 'AGREGAR Y USAR', exact: true }).click();
  await expect(page.getByText('Ingresa un número de cuenta de solo dígitos')).toBeVisible();
  await expect(page.getByText('Debes declarar que la cuenta está a tu nombre')).toBeVisible();
  await select(page, 'Banco', 'BCP');
  await page.getByLabel('Número de cuenta', { exact: true }).fill('001234567890');
  await page.getByLabel('Ponle nombre a tu cuenta', { exact: true }).fill('Mi BCP');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'AGREGAR Y USAR', exact: true }).click();
  await expect(
    page.getByRole('button', {
      name: '¿En qué cuenta deseas recibir tu dinero?',
      exact: true,
    }),
  ).toContainText('Mi BCP');
  await page.reload();
  await page
    .getByRole('button', {
      name: '¿En qué cuenta deseas recibir tu dinero?',
      exact: true,
    })
    .click();
  await expect(page.getByRole('button', { name: /Mi BCP - PEN/ })).toContainText('001234567890');
  await page.getByRole('button', { name: /Mi BCP - PEN/ }).click();
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('kambista.accounts.v1:demo@kambista.com') || '{}'),
  );
  expect(saved.version).toBe(1);
  expect(saved.accounts[0].accountNumber).toBe('001234567890');
});
test('recorrido completo, constancias y cierre de sesión', async ({ page }, testInfo) => {
  await onboard(page);
  await createOperation(page);
  await expect(page.getByText('Interbank', { exact: true })).toBeVisible();
  await expect(page.getByText('US$ 100.00', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText('US$ 100.00', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'YA HICE MI TRANSFERENCIA', exact: true }).click();
  await page.getByRole('button', { name: 'ENVIAR CONSTANCIA', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Selecciona tu constancia');
  const input = page.getByLabel('Constancia de transferencia', { exact: true });
  await input.setInputFiles({
    name: 'bad.exe',
    mimeType: 'application/octet-stream',
    buffer: Buffer.from('bad'),
  });
  await expect(page.getByRole('alert')).toContainText('imagen, PDF o Word');
  await input.setInputFiles({
    name: 'large.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.alloc(10 * 1024 * 1024 + 1),
  });
  await expect(page.getByRole('alert')).toContainText('10 MB');
  for (const name of ['constancia.png', 'constancia.doc', 'constancia.docx', 'constancia.pdf']) {
    await input.setInputFiles({
      name,
      mimeType: 'application/octet-stream',
      buffer: Buffer.from('demo'),
    });
    await expect(page.getByRole('alert')).not.toBeVisible();
  }
  await page.getByRole('button', { name: 'ENVIAR CONSTANCIA', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: '¡Constancia enviada!', exact: true }),
  ).toBeVisible();
  await expect(page.getByText('S/ 342.80', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'VOLVER A INICIO', exact: true }).click();
  if (testInfo.project.name === 'desktop')
    await page.getByRole('button', { name: 'MARÍA', exact: true }).click();
  else await page.getByRole('button', { name: 'Abrir menú', exact: true }).click();
  await page
    .getByRole(testInfo.project.name === 'desktop' ? 'menuitem' : 'button', {
      name: 'Cerrar sesión',
      exact: true,
    })
    .click();
  await expect(page).toHaveURL(/\/$/);
  expect(await page.evaluate(() => sessionStorage.getItem('kambista.operation.v1'))).toBeNull();
  expect(
    await page.evaluate(() => !!localStorage.getItem('kambista.accounts.v1:demo@kambista.com')),
  ).toBe(true);
});
test('protege rutas y conserva sesión al recargar', async ({ page }) => {
  await page.goto('/operacion/constancia');
  await expect(page).toHaveURL(/\/$/);
  await login(page);
  await page.reload();
  await expect(page).toHaveURL(/\/registro$/);
  await fillProfile(page);
  await page.getByRole('button', { name: 'CONTINUAR', exact: true }).click();
  await page.getByRole('button', { name: 'CONTINUAR', exact: true }).click();
  await page.goto('/operacion/exito');
  await expect(page).toHaveURL(/\/inicio$/);
});
