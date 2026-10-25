# Sistema de diseño — réplica Banco Plata

Medido sobre las capturas (1176×2556 px @3x → pantalla de 392 pt). Tokens en `src/design/tokens.css`.

## Color
| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `--c-bg` | `#F2F2F5` | `#000` | Fondo de pantallas |
| `--c-surface` | `#FFF` | `#1B1B1F` | Tarjetas y sheets |
| `--c-fill` | `#F2F2F5` | `#26262B` | Filas internas ("Payment dates", campos) |
| `--c-text` / `--c-text-2` / `--c-text-3` | `#111114` / `#6E6E76` / `#A3A3AB` | `#F5F5F7` / `#9A9AA3` / `#66666E` | Jerarquía de texto |
| `--c-orange` | `#FF5A0A` | igual | CTA principal, píldora PLATA, acentos de íconos |
| `--c-indigo` | `#3420FF` | `#7B6DFF` | Enlaces ("Ver", "Retirar", "Todo $…") |
| `--c-toggle` | `#3D2BFF` | igual | Interruptores activos |
| `--c-green` / `--c-red` / `--c-badge` | `#1FB25A` / `#EF2B2B` / `#EE1D23` | igual | Éxito, error/peligro, globos |
| Degradado de marca | naranja → rosa → violeta | — | "cashback", Plata+, montos de cashback |

Fondos de Home (Personalización): Silver (predeterminado), Black, Orange, Blue, Navy (`src/lib/selectors.ts → HOME_BG`).

## Tipografía
Inter (sustituto de SF Pro). Títulos de pantalla 26–30 px/700, saldo principal 36 px/700 (−1.2 de tracking), títulos de tarjeta 17 px/700, cuerpo 14–15 px, secundarios 12–13 px. Números tabulares en importes.

## Espaciado, radios y sombras
- Margen lateral 20 pt; separación entre tarjetas 12–20 pt.
- Radios: tarjetas 22–26 pt, filas internas 14–16 pt, botones píldora (999), sheets 34 pt arriba; diálogos flotantes 36 pt con margen de 8 pt.
- Sombras suaves solo en elementos flotantes (barra inferior, toasts, tarjeta bancaria).
- Tiles "glass" del Home: blanco 55 % + borde blanco + blur.

## Componentes (src/components)
- **layout.tsx**: `DeviceFrame`, `StatusBar` (hora 09:41 + píldora PLATA), `Screen`, `NavHeader` (botón circular atrás / X), `TabBar` flotante (Inicio, Pagar, Invertir, Invitar + chat), `BottomSheet` (X arriba a la derecha, arrastrable, variante flotante y completa), `toast` (píldora blanca arriba).
- **ui.tsx**: `Button` (primary, secondary, gray, dark, white, ghost, danger, blue; con estado de carga), `Card`, `CardTitle`, `Row`, `KV`, `Toggle`, `CheckCircle`, `Segmented`, `Field`, `Steps`, `Progress`, `Orb` (esfera de Movimientos), `Chip`, `Dots`.
- **keypad.tsx**: `NumPad` (teclado iOS gris con letras), `PasscodePad` (botones de vidrio), `PasscodeDots`, `CodeBoxes` (OTP/NIP), `AmountBox` ("$ Monto" + texto auxiliar).
- **visuals.tsx**: `BankCard` (metálica física Crédito, negra Cuenta, holográfica digital; cara con datos y estado congelado), `MiniCard`, `CardChip`, `SuccessBadge`, `WarningBadge`, `ErrorBadge`, `PlataRound`, `Illustration` (aproximación CSS de las ilustraciones 3D).
- **finance.tsx**: `AccountBox`, `AccountPickerSheet`, `ResultBlock` (pantalla de resultado con saldo antes → después), `ConfirmDialog`, `InfoSheet`.
- **brand.tsx**: wordmark PLATA (SVG con "A" en chevrón), Escudo de Plata, Mastercard, cuadros de cuenta, avatares, logos de comercios.
- **ios.tsx**: alertas de permisos de iOS y hoja de compartir.

## Iconografía
Íconos propios bicolor (negro + naranja) para Pagar/Depositar, Pagar servicios y Transferir; barra inferior redibujada; el resto con `lucide-react`.

## Movimiento
Pila tipo iOS (`navigation/AnimatedRoutes.tsx`): push lateral, modal desde abajo, fundido; cambio de pestaña sin animación. Sheets con resorte y arrastre para cerrar. Respeta `prefers-reduced-motion`.

## Idioma
La interfaz se escribe con los textos de las capturas (inglés) y se traduce al renderizar (`src/i18n`): el runtime JSX traduce hijos de texto y `placeholder`/`aria-label`/`title`/`alt`. **Español por defecto**; el inglés se elige en Perfil → Idioma. Diccionario y reglas en `src/i18n/es.ts`; en desarrollo `window.__i18nMissing` lista lo que falte.

## Aproximaciones
Las ilustraciones 3D (monedas, regalos, caja fuerte), fotos de partners, avatares 3D y logos de marcas se aproximan con CSS/SVG: no se usan las capturas como imágenes.
