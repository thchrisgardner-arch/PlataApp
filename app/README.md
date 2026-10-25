# Banco Plata — réplica navegable de estudio

Reconstrucción en React + TypeScript + Vite de la app móvil de Banco Plata a partir de las 715 capturas de `../` (no se usan como imágenes: cada pantalla está hecha con componentes). Datos ficticios y operaciones simuladas.

```bash
npm install
npm run dev        # http://localhost:5195
npm test           # pruebas unitarias (vitest)
npx playwright test  # barrido de rutas y recorridos completos
npm run build
```

- Idioma: español por defecto; inglés en Perfil → Idioma (`src/i18n`).
- Primer uso: onboarding completo. Después se pide el código de acceso creado.
- Restablecer la demo: Perfil → Restablecer datos de demostración.

Documentación: `docs/sistema-diseno.md`, `docs/rutas-y-flujos.md`, `docs/pendientes.md`, y en la carpeta superior `docs/catalogo-pantallas.md` (captura → ruta) y `docs/referencias-externas.md`.

Estructura: `src/components` (sistema de diseño), `src/screens/<módulo>` (pantallas y flujos), `src/navigation` (rutas y pila animada), `src/state/store.ts` (estado simulado con zustand), `src/data` (catálogos y datos semilla), `src/i18n` (traducción), `e2e` (Playwright).
