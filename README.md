# Duelo de Bloques

Block Blast 1 contra 1 en tiempo real. Borras líneas, encadenas combos y, cada X puntos, le quitas una línea del campo a tu rival.

Juega en https://vcerdan21.github.io/duelo-de-bloques/

## Modos

- **Máquina**: contra la IA (fácil, normal, difícil). Funciona sin conexión.
- **Clásico**: sin rival, a por tu récord. Funciona sin conexión.
- **Amigo**: online con un código de sala de 4 letras. Funciona entre redes distintas (wifi contra datos móviles).

## Power-ups

Salen dentro de un bloque de las piezas y se activan al borrar su línea. Si vas perdiendo, te salen más.

| Power-up | Efecto |
|---|---|
| Bomba | Revienta los bloques de alrededor (3×3) |
| Rayo | Borra toda su fila y su columna |
| Estrella | Puntos dobles en esa jugada |
| Hielo | Congela al rival 5 segundos |
| Bloques falsos | Le caen 3 bloques de piedra al rival |
| Escudo | Para el siguiente ataque, hielo o bloques falsos |

## Archivos

- `index.html`: el juego entero (HTML, CSS y JS en un solo archivo, sin dependencias externas).
- `sw.js`: service worker; guarda el juego en el dispositivo para jugar sin conexión. Sube el número de `CACHE` al cambiar archivos.
- `manifest.webmanifest`, `icons/`, `fonts/rubik.woff2`: instalación como app, iconos y tipografía (local, sin Google Fonts).

## Cómo funciona el modo amigo

Los dos móviles no se conectan directamente entre sí (eso fallaba entre redes distintas): se hablan a través de servidores
de mensajes públicos (MQTT sobre WebSocket: EMQX, HiveMQ, Mosquitto y Eclipse). El juego se conecta a los cuatro a la vez y
cada mensaje viaja por todos, así que si uno se cae la partida sigue. Los mensajes importantes (ataques, fin de ronda…)
se repiten hasta que el otro confirma que le han llegado.

Para publicar en Google Play conviene cambiar esos servidores públicos por uno propio (por ejemplo Supabase Realtime):
basta con sustituir la lista `RELAYS` y la función `mqttLink` de `index.html`.
