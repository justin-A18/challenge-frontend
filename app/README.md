# Kambista React Native

Aplicación móvil del reto Kambista implementada con Expo Router, React Native, NativeWind,
React Hook Form, Yup y Zustand. La navegación cubre inicio de sesión, registro, cotización,
registro de cuentas, transferencia y envío de constancia.

## Desarrollo

```bash
npm install
npm run start
```

Para abrir la aplicación en plataformas específicas:
```bash
npm run android
npm run ios
npm run web
```

El inicio de sesión y el registro son simulados. Usa `demo@kambista.com` y `Demo1234!` para
ingresar; para revisar los errores definidos por el reto, usa DNI `12345678` o celular
`999999999`.

## Servicios y datos de prueba

- La cotización consume `GET https://api.kambista.com/v1/exchange/kambista/current`.

- El cálculo consume `GET https://api.kambista.com/v1/exchange/calculates`, enviando
  `originCurrency`, `destinationCurrency`, `amount` y `active=S`.

- Los bancos y orígenes de fondos se leen de `../mocks/bankAccounts.json` y
  `../mocks/sourceFunds.json`.

- Las cuentas bancarias y el estado de la operación se mantienen en Zustand durante la sesión.

- La constancia se selecciona con el selector de documentos nativo; el flujo de demostración
  conserva la metadata en memoria, ya que el reto no define un endpoint para subir archivos.

## Android APK

El perfil `preview` de [eas.json](./eas.json) está configurado para generar un APK instalable:
```bash
npx eas-cli build --platform android --profile preview
```

La creación del APK requiere que la cuenta de Expo y el proyecto EAS estén configurados para
este repositorio.

## Organización del comportamiento

Los hooks de cada módulo coordinan formularios, navegación, servicios y stores. Los campos
reutilizables usan React Hook Form directamente y conservan sus interacciones visuales locales.
Los tipos y helpers exclusivos de una primitiva compartida se mantienen junto a ella.

La recomendación de 80 líneas admite excepciones en la composición de la calculadora,
el ciclo de cotización y el calendario. Sus estados forman una sola interacción coherente.
En cotización, mantener juntas la cancelación, el debounce y la comprobación de la respuesta
vigente permite revisar las condiciones de carrera en un solo lugar. La selección temporal,
la navegación de meses y la confirmación del calendario se revisan como un único flujo.
Estas excepciones priorizan la cohesión y evitan wrappers que solo trasladan llamadas.

## Verificación local

Ejecutar desde la raíz del repositorio.

```bash
node app/node_modules/typescript/bin/tsc --noEmit -p app --noUnusedLocals --noUnusedParameters
npm --prefix app run lint
```

Las pantallas y componentes utilizan PascalCase, los hooks coinciden con el nombre
camelCase de su función y las carpetas propias usan kebab-case. Los archivos auxiliares
se colocan junto al componente que los utiliza. Cada módulo expone su API mediante
exports explícitos en index.ts.
