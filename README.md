# PILCHA

Una webapp que, según el clima de donde estás, te arma el outfit del día con la ropa de tu propio placard y te sugiere paletas de colores que combinan con el día.

TP Final de Programación Multimedial III (UMAI). Consigna: https://github.com/lamaro/maimo-2026-tp-final

> README en construcción. Se completa al cierre del proyecto con descripción, benchmark, modelo de datos, mapa de navegación, opcionales, usuario de prueba, capturas y reflexión sobre el uso de IA.

## Tecnologías

- Next.js 16 (App Router, JavaScript)
- Tailwind CSS 4
- Firebase Authentication y Cloud Firestore
- Vercel Blob para imágenes
- Open-Meteo para clima y geocoding
- Deploy en Vercel

## Decisiones técnicas

- **Cache Components desactivado.** `create-next-app` lo activa por defecto en Next.js 16. Lo apagamos para usar el modelo de caché clásico: el layout privado puede leer la cookie de sesión directamente y las llamadas al clima se cachean con `fetch(..., { next: { revalidate: 1800 } })`.
- **`proxy.js` en lugar de `middleware.js`.** En Next.js 16 `middleware.js` se renombró a `proxy.js`.

## Instalación

```bash
git clone https://github.com/MartinIsrael05/TP-Final-PMIII.git
cd TP-Final-PMIII
npm install
cp .env.example .env.local   # completar con las credenciales
npm run dev
```

La app queda en http://localhost:3000.

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Sirve el build |
| `npm run lint` | ESLint |

## Variables de entorno

Ver `.env.example`. Nunca commitear `.env.local`.
