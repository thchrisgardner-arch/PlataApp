# Pendientes y decisiones

## Reconstrucciones aproximadas (no hay captura o la captura no muestra el resultado)
- `/auth/lock`: pantalla de bloqueo al volver a abrir la app (las capturas solo muestran la creación del código).
- `/msi`: resumen de MSI desde Crédito (la tarjeta "MSI" existe en 0134, su destino no aparece).
- Verificación de identidad: pasos de cámara simulados; el resultado reproduce "Identity verification failed" (0431).
- Depósito con tarjeta de otro banco: se registra la tarjeta (0328) pero no aparece la pantalla de importe ni el resultado.
- Textos legales: se muestra un documento de ejemplo, no el contrato real.
- Respuestas del chat: automáticas y limitadas a PIN, monto a pagar, fecha de pago, línea de crédito y datos personales.
- Ilustraciones 3D, fotos de aliados y avatares 3D: aproximaciones CSS/SVG.

## Simulado a propósito (prototipo de estudio)
- Ninguna operación es real: no hay APIs de Banco Plata ni bancos externos; los datos son ficticios.
- OTP: cualquier código de 4 dígitos; `1111` simula "Código incorrecto".
- Código de acceso y NIP se guardan solo en `localStorage` del navegador.
- Escaneo de código de barras, cámara, contactos, calendario, Face ID y hoja de compartir de iOS son simulados.
- Sitios externos (aliados, redes, app de BBVA) no se abren: se muestra un aviso.

## Idioma
- La app se muestra en español por defecto; inglés desde Perfil → Idioma.
- Nombres propios, marcas y nombres de productos de Plata (Crédito, Cuenta, Ahorro Fijo/Flexible, Plata+) no se traducen.
- Si se agrega una pantalla nueva, correr la app en desarrollo y revisar `window.__i18nMissing`; el barrido `e2e/routes.spec.ts` falla si quedan frases en inglés.

## Mejoras posibles
- Dividir el bundle (921 kB) por módulo con `import()` perezoso.
- Comparación píxel a píxel automática contra las capturas (hoy la comparación es visual, pantalla por pantalla).
- Estados de error de red (la demo no tiene red).
