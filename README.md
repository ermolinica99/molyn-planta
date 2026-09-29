# MOLYN · Planta

Aplicación web de planta (operarios y encargado) del sistema MOLYN de inventario de núcleos.

Desplegada en GitHub Pages: https://ermolinica99.github.io/molyn-planta/

## Archivos
- `index.html` — la aplicación (login por PIN, vista operario y encargado).
- `manifest.json` + iconos — instalación como app (PWA).
- `favicon.ico` — icono de pestaña.

## Uso
Abrir la URL en el móvil o tablet de planta. Entrar con el PIN de usuario.
- `sw.js` — service worker: permite abrir la app aunque la tablet se quede sin red
  (siempre intenta primero descargar la versión más reciente).

## Funcionamiento en planta
- La sesión de un **puesto** queda guardada en la tablet (no hace falta volver a meter el PIN
  al reiniciar). "Salir" la cierra. La del **encargado** dura solo mientras la app está abierta.
- Con la app abierta la pantalla no se apaga (si se bloquea, los cronómetros y la sincronización se paran).
- Sin conexión todo se guarda en la tablet y se envía solo al volver la red (barra de estado arriba).
