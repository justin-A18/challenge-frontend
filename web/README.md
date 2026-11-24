# Kambista Web

Aplicación responsive del reto: login → perfil → felicitaciones → cotización →
cuentas y origen de fondos → transferencia → constancia → resumen → Inicio.

## Ejecutar con npm

Requiere Node.js 22.12 o posterior compatible con Nuxt 4.

```bash
cd web
npm install
npm run dev
```

Abre http://localhost:3000. Para producción:

```bash
npm run build
npm run preview
```

## Credenciales y datos de prueba

El login mock acepta exclusivamente:

| Campo | Valor |
|---|---|
| Correo | demo@kambista.com |
| Contraseña | Demo1234! |

Otro correo o contraseña produce un error de credenciales. El email se valida
en tiempo real y la contraseña es obligatoria. Al entrar se abre completar perfil.

| Campo del perfil | Ejemplo válido | Caso rechazado |
|---|---|---|
| Nombres completos | María López | María123 o caracteres especiales |
| DNI | 87654321 | Menos/más de 8 dígitos; 12345678 devuelve DUPLICATE_DNI |
| CE | 123456789 | Longitud distinta de 9 dígitos |
| Pasaporte | AB123456 | Menos de 8 o más de 15 caracteres alfanuméricos |
| Celular | 987654321 | Longitud distinta de 9; 999999999 devuelve INVALID_PHONE |
| Nacimiento | 1990-06-15 | Fecha inexistente, futura o menor de 18 años |
| Términos | Marcados | Sin marcar impide continuar |
| Política de datos | Opcional | Puede quedar sin marcar |

Los enlaces de términos y política abren modales independientes. Sus textos son
demostrativos. Los errores mock siguen el contrato APIError del README principal.

## Recorrido de operación

1. Completa el perfil y continúa desde felicitaciones hacia Inicio.
2. La calculadora comienza en USD → PEN. Cambia cualquiera de los selectores,
   invierte con las flechas o elige Compra (USD → PEN) / Venta (PEN → USD).
3. Escribe, por ejemplo, 100. El monto recibido es `exchange`; el ahorro viene
   de `savings.amount`. Las tasas actuales se muestran en ambas pestañas.
4. Inicia la operación y elige el banco desde el cual enviarás tu dinero.
5. Abre la cuenta receptora. Si no tienes una, elige Agregar cuenta. Usa tipo
   Ahorros o Corriente, banco BCP, número `001234567890`, alias opcional
   `Mi BCP` y marca la declaración de titularidad.
6. La cuenta queda seleccionada. Elige Ahorros como origen de fondos y continúa.
7. Revisa los datos y pulsa Ya hice mi transferencia.
8. Adjunta PNG, JPEG, WebP, PDF, DOC o DOCX de hasta 10 MB y envía la constancia.
9. Revisa el resumen y vuelve a Inicio. En desktop, el menú del nombre contiene
   Cerrar sesión; en móvil está dentro del menú principal.

Las cuentas se filtran por la moneda que recibirás. El número permanece como
texto para conservar ceros iniciales. Si cambias la moneda y no tienes una cuenta
compatible, debes crear una antes de continuar.

## APIs y persistencia

- Los servicios de cotización consultan directamente
  `https://api.kambista.com/v1/exchange/kambista/current` y
  `https://api.kambista.com/v1/exchange/calculates`, enviando
  `originCurrency`, `destinationCurrency`, `amount` y `active=S`.
- No se utiliza un BFF de Nuxt para estas solicitudes; el navegador requiere
  que la API de Kambista permita solicitudes CORS desde el origen de la app.
- Bancos y orígenes se importan directamente desde `../mocks` con el alias
  `@mocks`.
- Las cuentas se guardan en localStorage con formato versionado, bajo
  `kambista.accounts.v1:<correo>`.
- Sesión y operación activa se guardan en sessionStorage. Las pantallas posteriores
  utilizan la cotización confirmada, sin recalcularla al navegar o recargar.
- Cerrar sesión borra sesión y operación; conserva las cuentas guardadas.
- Los archivos solo viven en memoria; no se guardan en localStorage ni se suben.

**Datos demostrativos:** no existen APIs de autenticación, registro, cuentas,
transferencias o carga de archivos. La cuenta receptora de Kambista, RUC, titular
y tipo de cuenta provienen de la referencia visual y se reutilizan como fixture
para los bancos. No deben utilizarse para realizar pagos reales.

Si la API de cotización falla, se muestra un mensaje con Reintentar y se bloquea
Iniciar operación. No se inventan tasas ni ahorros de respaldo.

## Arquitectura y decisiones

- Módulos `auth`, `onboarding` y `transactions`; lógica en composables,
  servicios, schemas, tipos inferidos y constantes por dominio.
- Primitivas visuales y estado de sesión en `app/shared`. Tailwind 4 define los
  tokens de color, fuente y radios. Se usan imágenes originales, sin Lucide.
- Vee Validate v5 recibe directamente schemas Zod; los tipos se derivan del schema
  antes de pasarlos a useForm.
- Cada pantalla de operación tiene su propio componente. Los overlays usan dialog
  nativo para gestionar foco, Escape y bloqueo del fondo.
- Las vistas protegidas se renderizan en cliente porque sus datos mock viven en
  almacenamiento del navegador. Los guardas son parte de la demostración, no un
  mecanismo de autenticación seguro para producción.
- Las solicitudes de cálculo usan debounce y AbortController; solo la respuesta
  vigente puede actualizar el resultado. Una cancelación no muestra un error.
- La referencia incluye cupones y ejemplos de cuentas/importes. Los importes y
  cuentas del flujo son reales dentro del mock; no se simulan descuentos del cupón.

## Validaciones automatizadas

```bash
npm run typecheck
npm run test:unit
npm run test:e2e
npm run test:e2e:report
```

Playwright usa Google Chrome instalado, inicia su propio servidor en el puerto
3100 y aísla sus archivos de Nuxt en `.cache/nuxt-e2e`. Si no tienes Chrome,
instálalo o configura el canal de Chromium en playwright.config.ts.

La suite cubre desktop (1440 px), móvil (390 px), credenciales, validaciones,
consentimientos, errores de registro, cotizaciones en ambas direcciones, ahorro
cero, errores y reintentos, cancelaciones, respuestas fuera de orden, cuentas por
moneda, persistencia, archivos inválidos/grandes y recorrido hasta cerrar sesión.

La prueba externa se activa expresamente; no utiliza interceptores:

```powershell
$env:RUN_LIVE_API = '1'
npm run test:e2e -- __tests__/e2e/live.spec.ts --project=desktop
```

## Referencias y evidencia visual

[DESIGN-REFERENCE-MAP.md](DESIGN-REFERENCE-MAP.md) inventaría los 70 PNG y sus
dimensiones, rutas y estados. Las referencias permanecen intactas.

```bash
npm run design:map
npm run test:e2e -- __tests__/e2e/visual.spec.ts
npm run design:report
```

El informe se genera en `.cache/visual/index.html`: referencia, captura y mapa
de diferencias por pantalla y dispositivo. También se guardan capturas en el
reporte Playwright y trazas de los fallos.

Las barras del dispositivo se excluyen de la comparación móvil. Las métricas
actuales son diferencias crudas: incluyen importes, nombre, número de cuentas y
textos de negocio que difieren de los ejemplos estáticos. Las pruebas de captura
comprueban imágenes cargadas y ausencia de desbordamiento; **no certifican igualdad
píxel a píxel**. El informe permite revisar esas diferencias sin reemplazar las
referencias originales.
