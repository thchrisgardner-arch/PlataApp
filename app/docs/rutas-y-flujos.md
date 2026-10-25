# Rutas y flujos

Todas las rutas están en `src/navigation/routes.tsx`, `routes2.tsx` y `routes3.tsx`; cada una lleva sus capturas de referencia (`refs`). El catálogo completo captura → ruta está en `../docs/catalogo-pantallas.md`.

Acceso a la demo: en el primer uso se recorre el onboarding; después, código de acceso (el que se creó; el de las pruebas automáticas es `123456`). Los datos se guardan solo en este navegador (`localStorage`, clave `plata-replica`) y se restablecen desde Perfil → Restablecer datos de demostración.

## Módulos y recorridos

| Módulo | Entrada | Recorrido |
|---|---|---|
| Onboarding | `/auth/splash` | Splash → permisos (alertas iOS) → teléfono → OTP (1111 = código incorrecto, reenviar) → crear y confirmar código → Face ID → Inicio. Bloqueo con código o Face ID simulado. |
| Inicio | `/home` | Perfil, cashback, MSI por diferir, Movimientos, Crédito/Cuenta/Ahorro/Inversiones, entrega de tarjeta, nuevos productos. |
| Crédito | `/account/credito` | Retirar con MSI, tarjetas, Pagar (tarjeta, desde cuenta Plata, CLABE, efectivo en tiendas/bancos), servicios, transferir, pago de crédito con calendario, CLABE (copiar/compartir), MSI, estados de cuenta, documentos, seguro, tarjeta de uso especial. |
| Cuenta | `/account/cuenta` | Depositar, + Ahorro, intereses, nómina, límite de depósito → verificación de identidad (simulada, termina en "falló" como en las capturas), IPAB. |
| Ahorro | `/ahorro/new` | Flexible (10 %) o Fijo (30/90/180/360 días o plazo propio, simulador) → abierto → depositar entre cuentas → detalle (renombrar, intereses, cerrar Flexible con confirmación). |
| Tarjetas | `/card/:id` | Ver datos (copiar), congelar/descongelar, límite mensual (fijar, +$1,000, monto propio, desactivar), NIP (ver, leer instrucciones, nuevo NIP con aviso de patrón débil, activación en cajero simulada), compras en línea / cajero, renovar datos (digital), reponer, desechar, tarjeta adicional (digital inmediata o física con entrega). |
| Entrega | `/delivery/new` | Intro → mapa (fuera de zona) → búsqueda de dirección → confirmar dirección → programada → seguimiento → empaque → marcar entregada (demo) → fijar NIP. |
| Pagos | `/pay` | Depositar, Transferir (CLABE, entre cuentas, tarjeta, teléfono Plata), favoritos (ordenar, eliminar, agregar transferencia o servicio), servicios por categoría, búsqueda. |
| Transferencia | `/transfer/recipient` | Destinatario (detecta banco por CLABE/tarjeta, nombre, guardar en favoritos) → importe (cuenta origen, detalles, campos adicionales, MSI desde Crédito a otro banco) → confirmación (OTP si supera el Monto transaccional) → resultado → comprobante. |
| Servicios | `/bills` | Categoría → proveedor → referencia (escaneo simulado) → importe → confirmación → resultado con cashback; Mis recibos con vencidos. |
| Movimientos | `/transactions` | Filtro por cuenta/tarjeta, búsqueda, gastado/recibido/cashback, diferir a MSI, detalle (comprobante, repetir, MSI relacionado), analítica por mes y categoría. |
| Cashback y Plata+ | `/cashback/intro` | Elegir hasta 4 categorías (bloqueadas sin Plata+) → ¡Excelente elección! + calificación → cashback del mes, aliados (filtros, búsqueda, detalle), MSI a cashback; Plata+ (carrusel, unirse, beneficios, administrar/cancelar). |
| MSI | `/msi` | Diferir compras (intro de 3 pasos, selección, plazo), retiro con MSI (monto, plan, CLABE destino, condiciones, resultado), detalle de pagos, aliados MSI. |
| Inversiones | `/invest` | Portafolio, acción de regalo (descubrir monto, elegir empresa), activos con gráfica (rangos y arrastre), predicción, dividendos, análisis IA, compra/venta a mercado y límite (OTP ≥ USD 200), órdenes activas y cancelación, análisis y perfil de riesgo (10 preguntas), 3 % anual en USD, listas, objetivos, lecciones. |
| Perfil | `/profile` | Foto/avatar, Plata+, datos personales (teléfono con OTP, correo), seguridad financiera (Monto transaccional y operaciones monetarias con OTP, beneficiarios), cuentas destino, ajustes (Face ID, cambio de código), personalización (fondo, ícono, modo claro/oscuro/sistema), idioma, notificaciones (cambio con OTP), redes, documentos legales, cerrar sesión. |
| Invitar | `/invite` | Intro (3 pasos), enlace (copiar/compartir), invitar contactos, invitaciones con recordatorio, usuario editable, condiciones. |
| Soporte | `/chat` | Chat con respuestas rápidas, respuestas automáticas, reacciones (doble clic). |

## Pruebas
- `npm test` (vitest): formato, selectores, traducción y acciones del estado (21 pruebas).
- `npx playwright test`: barrido de las ~100 rutas (sin errores de consola, sin pantallas no disponibles y sin frases en inglés), cambio de idioma y 14 recorridos completos (16 pruebas).
