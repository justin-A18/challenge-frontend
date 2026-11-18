# Kambista Frontend Challenge

👋 Somos [Kambista](https://kambista.com) y estamos en la búsqueda de un nuevo miembro para nuestro equipo de tech que nos ayude a seguir ofreciendo la mejor experiencia de cambio. Para esto hemos preparado un reto técnico que consiste en desarrollar una aplicación de cambio de divisas.

## 📂 Pruebas

Elige la prueba que corresponda a la posición a la que postulas. Cada una tiene su propio diseño, stack y requerimientos funcionales:

| Carpeta | Plataforma | Stack principal |
|---------|------------|-----------------|
| [app](app/README.md) | Móvil | Expo · React Native · TypeScript |
| [web](web/README.md) | Web | Nuxt 4 · TypeScript |

Lo que se describe a continuación aplica a ambas pruebas.

## 🌐 APIs a utilizar

1. Endpoint para obtener el tipo de cambio:

```
https://api.kambista.com/v1/exchange/kambista/current
```

2. Endpoint para la calculadora:

```
https://api.kambista.com/v1/exchange/calculates?originCurrency=PEN&destinationCurrency=USD&amount={cantidad}&active=S
```

Para la dirección inversa se intercambian los valores de `originCurrency` y `destinationCurrency`.

Los servicios de login y registro no cuentan con API; deben simularse (mock). Para probar los errores, el DNI `12345678` debe devolver `DUPLICATE_DNI` y el celular `999999999` debe devolver `INVALID_PHONE`.

## 🗂️ Mocks de data adicional

Se incluyen dos archivos JSON con datos de prueba en la carpeta [`mocks`](mocks):

1. **`bankAccounts.json`**
   - Listado completo de bancos
   - Uso:
     - Selector de banco al agregar cuenta
     - Elección de entidad financiera en operaciones

2. **`sourceFunds.json`**
   - Listado de orígenes de fondos
   - Uso:
     - Selector al crear operaciones

## 🚨 Manejo de errores

1. **Errores generales de los formularios**:
   - Validación en tiempo real para:
     - Formato de email correcto.
     - Nombre sin caracteres especiales ni números.
     - Formato de documento de identificación acorde a DNI (8 dígitos), CE (9 dígitos), PASAPORTE (de 8 a 15 caracteres).
     - Teléfono (9 dígitos).
     - Fecha de nacimiento (solo registro válido para mayores de edad).
     - Número de cuenta bancaria solo dígitos.
2. **Errores de API**:
   - Considerar errores en servicios como:
     - Número de documento o celular en uso.
     - Error general en la respuesta del servicio.

```typescript
interface APIError {
  success: false
  data: {
    name: 'DUPLICATE_DNI' | 'INVALID_PHONE' | 'SERVER_ERROR' // Ejemplos
    title: string
    message: string
  }
}
```

Ejemplo de error en servicio:

```json
{
  "success": false,
  "data": {
    "name": "DUPLICATE_DNI",
    "title": "DNI en uso",
    "message": "El número de documento registrado ya está en uso."
  }
}
```

## 📤 Instrucciones de entrega

1. Hacer fork del repositorio: [challenge-frontend](https://github.com/kambista/challenge-frontend)
2. Clonar el fork:
   ```
   git clone git@github.com:USERNAME/challenge-frontend.git
   ```
3. Crear un nuevo branch con tu nombre:
   ```
   git checkout -b {nombre-apellido}
   ```
4. Desarrollar la solución dentro de la carpeta de la prueba elegida (`app` o `web`) y documentar en su README.md las instrucciones de ejecución.
5. Realizar commits con mensajes semánticos.
6. Crear un Pull Request y notificar a talentohumano@kambista.com.

El tiempo estimado para completar la prueba es de 7 días desde el inicio de la misma. En la siguiente etapa se realizará una entrevista técnica para revisar la solución.

## 🏆 Criterios de evaluación

- **Calidad de código**: Arquitectura limpia, modularización y buenas prácticas.
- **Fidelidad al diseño**: Fidelidad y creatividad en la resolución de los requerimientos de diseño.
- **Performance**: Componentes optimizados y manejo eficiente de estado.
- **Mantenibilidad**: Prioriza legibilidad y escalabilidad, con estructura de archivos clara y consistente.
- **Manejo de errores**: Validaciones y errores de API manejados de forma clara para el usuario.

## 💡 Bonus (opcional)

- Animaciones.
- Agregar en la documentación (README.md) las decisiones técnicas relevantes.
- Tests, con las herramientas indicadas en el README de cada prueba.

---

Para cualquier duda o consulta, por favor contactar a talentohumano@kambista.com

Quedamos atentos a cualquier consulta adicional, ¡muchos éxitos! 🚀
