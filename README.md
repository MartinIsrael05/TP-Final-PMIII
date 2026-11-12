# PILCHA

Una webapp que, según el clima de donde estás, te arma el outfit del día con la ropa de tu propio placard y te sugiere paletas de colores que combinan con el día.

**Demo:** https://pilcha-ropa.vercel.app

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
- **La ubicación y el horario van en la URL** (`/?lat=...&lon=...&ciudad=...&desde=9&hasta=20`). Así la página pide el clima en el servidor con caché de 30 minutos y el link se puede compartir. Las coordenadas se redondean a 2 decimales (~1 km) para no exponer la ubicación exacta.

## Librerías

| Librería | Para qué |
| --- | --- |
| `firebase` | Login con email/contraseña y Google desde el navegador |
| `firebase-admin` | Verificar sesiones y escribir en Firestore desde el servidor. Es la única forma de validar en el servidor quién es el usuario |

## Autenticación

1. El usuario se loguea con Firebase Auth en el navegador y obtiene un ID token.
2. El cliente manda el token a `POST /api/session`. El servidor lo verifica con Firebase Admin y lo cambia por una session cookie `httpOnly` de 5 días. Si es el primer ingreso, crea el documento `users/{uid}`.
3. `proxy.js` redirige a `/login` si alguien entra a una ruta privada sin la cookie. Es un chequeo rápido que no valida la cookie.
4. El layout privado y las Server Actions llaman a `getCurrentUser()` (`lib/auth/session.js`), que sí verifica la cookie con Firebase Admin.
5. Para salir, `DELETE /api/session` borra la cookie y el cliente cierra la sesión de Firebase.

`AuthContext` guarda el usuario del lado del cliente solo para la interfaz (nombre y botón de salir).

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
