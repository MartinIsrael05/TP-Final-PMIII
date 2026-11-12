# CLAUDE.md

Guía del proyecto para Claude Code. Leer completo antes de escribir código.

Ver también `AGENTS.md`: este proyecto usa Next.js 16, que tiene cambios respecto de versiones anteriores. Ante la duda, consultar la documentación en `node_modules/next/dist/docs/`.

## El proyecto

TP Final de Programación Multimedial III (UMAI). Trabajo grupal.

**Nombre:** PILCHA.

**Propuesta:** una webapp que, según el clima de donde estás, te arma el outfit del día con la ropa de tu propio placard y te sugiere paletas de colores que combinan con el día.

**Usuario:** cualquier persona que sale a la calle y no sabe qué ponerse según el clima, especialmente en ciudades con mucha amplitud térmica en el día.

**Problema:** las apps de clima te dan números, no decisiones. Esta app traduce el pronóstico en ropa concreta que el usuario tiene, y aprende de su feedback.

La consigna completa está en el README original de la cátedra (https://github.com/lamaro/maimo-2026-tp-final). Todo lo que se construya tiene que cumplir sus requisitos mínimos.

## Reglas para trabajar en este repo

- **JavaScript, no TypeScript.** Next.js con App Router y Tailwind CSS.
- El código tiene que poder explicarse en la defensa. Preferir soluciones simples y legibles a abstracciones ingeniosas. No sumar librerías sin necesidad; si se suma una, agregar la justificación en el README.
- Nombres del dominio en español (`prendas`, `outfits`, `recomendar`), código en general en inglés cuando es infraestructura (`lib/firebase/admin.js`).
- Textos de la UI en español rioplatense (voseo). Sin guiones largos en los textos.
- Server Components por defecto. `"use client"` solo cuando haga falta (estado, efectos, eventos, APIs del navegador como geolocalización). Comentar brevemente por qué un componente es cliente.
- Todas las escrituras van por **Server Actions** que verifican la sesión en el servidor con Firebase Admin. Nunca confiar en un `uid` que venga del cliente.
- Cada ruta con datos tiene `loading.js` y `error.js`; las rutas dinámicas usan `notFound()` cuando el recurso no existe o no es del usuario.
- Cada página exporta `metadata` o `generateMetadata`.
- Commits chicos y descriptivos al terminar cada paso. La cátedra evalúa el historial.
- Nunca commitear `.env.local` ni credenciales. Mantener `.env.example` actualizado.

## Stack

| Pieza | Elección | Por qué |
| --- | --- | --- |
| Framework | Next.js 16 (App Router, JS) | Pedido por la consigna. `cacheComponents` desactivado: usamos el modelo de caché clásico (`fetch` con `revalidate`) |
| Estilos | Tailwind CSS | Pedido por la consigna |
| Auth | Firebase Authentication (email/contraseña + Google) | Consigna pide email y un proveedor social |
| Sesión en servidor | Firebase Admin SDK + session cookie (httpOnly) | Permite proteger rutas y validar Server Actions en el servidor |
| Base de datos | Cloud Firestore | Subcolecciones por usuario simplifican la seguridad |
| Imágenes | Vercel Blob | Firebase Storage pide plan Blaze para buckets nuevos; Blob funciona en el plan gratis de Vercel |
| Clima | Open-Meteo | Gratis, sin API key, pronóstico por hora, lluvia, viento y UV |
| Geocoding | Open-Meteo Geocoding API | Mismo proveedor, sin key |
| Gráficos | Recharts | Solo para `/stats` |
| Deploy | Vercel | Pedido por la consigna |

## Funcionalidades

### 1. Recomendación del día (núcleo)

- Ubicación por `navigator.geolocation`. Si el usuario no da permiso, buscador de ciudad (geocoding de Open-Meteo). Logueado, se usa su ciudad por defecto.
- Se pide a Open-Meteo el pronóstico por hora del día y se recorta a la **ventana entre la hora de salida y la de vuelta** del usuario (por defecto 9 a 20, editable en el perfil y en la pantalla).
- De esa ventana se calculan: temperatura mínima, máxima, sensación térmica promedio, probabilidad máxima de lluvia, viento máximo, UV máximo, código de clima predominante y si es de día.
- Con eso, `lib/recomendar.js` devuelve los requerimientos y el outfit (ver "Motor de recomendación").
- Si el usuario no tiene prendas cargadas (o no está logueado), se muestra la recomendación genérica en texto ("remera, short y zapatillas cómodas") y una invitación a cargar el placard.

### 2. Placard (entidad principal con ABM)

- Alta, edición, baja y listado de prendas.
- Campos: nombre, categoría (`superior`, `inferior`, `calzado`, `abrigo`, `accesorio`), color (hex + nombre legible), nivel de abrigo 1 a 5, impermeable (bool), foto opcional.
- Validación del formulario en cliente y de nuevo en la Server Action.
- Filtros por categoría, color y nivel de abrigo; búsqueda por nombre; orden por fecha o por uso.

### 3. Paletas de colores

- Paleta base según condición climática y momento del día. Las paletas viven en Firestore (`paletas`) y las edita el admin; se cargan con un seed inicial.
- Cada paleta tiene tipo de armonía (`analoga`, `complementaria`, `neutros-acento`) y 4 a 6 colores.
- El outfit sugerido prioriza prendas cuyos colores combinan con la paleta del día y entre sí (ver `lib/colores.js`).
- La interfaz toma colores de la paleta del día (variables CSS en el layout de `/hoy`).
- Ruta pública `/paletas` para explorar todas, y `/paletas/[clima]` con metadata dinámica y Open Graph.

### 4. Historial y aprendizaje

- "Usé este outfit": guarda el outfit con un snapshot del clima.
- Después el usuario lo califica: `frio`, `bien` o `calor`.
- Cada calificación ajusta `ajusteTermico` del usuario: `frio` suma 0.5, `calor` resta 0.5, `bien` no cambia. Rango entre -5 y +5.

### 5. Modo viaje

- El usuario elige ciudad y rango de fechas (hasta 14 días, que es lo que cubre el pronóstico).
- Se calcula el rango de temperaturas y los días de lluvia, y se genera la lista de qué llevar a partir del placard, sin repetir más de lo necesario.
- Se puede guardar como `viaje` para verlo después.

### 6. Estadísticas

- Prendas más usadas, prendas nunca usadas, distribución de colores del placard, calificaciones por rango de temperatura.

### 7. Admin

- Rol `admin` en el documento del usuario (y como custom claim para validarlo en servidor).
- `/admin` para ABM de paletas.

## Rutas

| Ruta | Acceso | Contenido |
| --- | --- | --- |
| `/` | Pública | Landing + recomendación genérica con geolocalización |
| `/login`, `/registro` | Pública | Auth |
| `/paletas` | Pública | Explorar paletas |
| `/paletas/[clima]` | Pública | Detalle de paleta, metadata dinámica |
| `/hoy` | Privada | Outfit del día con el placard propio |
| `/placard` | Privada | Listado con filtros |
| `/placard/nueva` | Privada | Alta de prenda |
| `/placard/[id]` | Privada | Detalle y edición |
| `/historial` | Privada | Outfits usados |
| `/historial/[id]` | Privada | Detalle y calificación |
| `/viajes`, `/viajes/[id]` | Privada | Modo viaje |
| `/stats` | Privada | Dashboard |
| `/perfil` | Privada | Ciudad, horarios, sensibilidad térmica |
| `/admin` | Privada, solo admin | ABM de paletas |

Usar route groups: `app/(public)` y `app/(private)`, con un layout privado que verifica la sesión en servidor y redirige a `/login` si no hay.

## Modelo de datos (Firestore)

```
users/{uid}
  nombre: string
  email: string
  rol: "user" | "admin"
  ciudad: { nombre, lat, lon }
  horaSalida: number        // 0 a 23
  horaVuelta: number
  sensibilidad: "friolento" | "normal" | "caluroso"
  ajusteTermico: number     // -5 a 5, lo mueve el feedback
  createdAt: timestamp

users/{uid}/prendas/{prendaId}
  nombre: string
  categoria: "superior" | "inferior" | "calzado" | "abrigo" | "accesorio"
  color: { hex, nombre }
  abrigo: number            // 1 a 5
  impermeable: boolean
  imagenUrl: string | null
  usos: number
  ultimoUso: timestamp | null
  createdAt, updatedAt: timestamp

users/{uid}/outfits/{outfitId}
  prendaIds: string[]
  fecha: timestamp
  clima: { tempMin, tempMax, sensacion, lluviaProb, viento, uv, codigo, ciudad }
  paletaId: string
  calificacion: "frio" | "bien" | "calor" | null
  nota: string

users/{uid}/viajes/{viajeId}
  ciudad: { nombre, lat, lon }
  desde, hasta: timestamp
  resumenClima: { tempMin, tempMax, diasLluvia }
  prendaIds: string[]

paletas/{paletaId}
  clima: "soleado-calido" | "soleado-templado" | "nublado" | "lluvia" | "frio" | "noche"
  nombre: string
  armonia: "analoga" | "complementaria" | "neutros-acento"
  colores: string[]         // hex
  descripcion: string
```

### Reglas de Firestore

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
      match /{sub=**} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
      }
    }
    match /paletas/{id} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

Las Server Actions usan Admin SDK (que saltea las reglas), así que **cada action tiene que verificar la sesión y escribir solo bajo `users/{uidDeLaSesion}`**. Las reglas protegen cualquier acceso desde el cliente.

## Autenticación en servidor

1. El cliente loguea con Firebase Auth (email/contraseña o Google) y obtiene el ID token.
2. Hace POST a `app/api/session/route.js` con el token. El handler lo verifica con Admin y crea una session cookie (`createSessionCookie`) httpOnly, secure, de 5 días.
3. `proxy.js` (en Next.js 16 reemplaza a `middleware.js`) solo chequea que la cookie exista y redirige a `/login` en rutas privadas. Es un chequeo optimista y rápido: corre antes de cada request, así que no verifica la cookie con Admin SDK.
4. La verificación real (`verifySessionCookie`) se hace en `lib/auth/session.js` con una función `getCurrentUser()` que usan el layout privado y todas las Server Actions.
5. Logout: DELETE a la misma ruta, que borra la cookie, y `signOut()` en el cliente.

El usuario activo del lado del cliente va en un `AuthContext` (Context API), solo para UI (avatar, nombre, botón de logout).

## Motor de recomendación (`lib/recomendar.js`)

Función pura, sin acceso a red ni a Firebase, para que se pueda testear y explicar.

```
recomendar({ clima, perfil, prendas, paleta }) => {
  tempEfectiva, nivel, requerimientos, outfit, alertas, textoGenerico
}
```

**Temperatura efectiva**

```
offsetSensibilidad = { friolento: -3, normal: 0, caluroso: +3 }
tempEfectiva = clima.sensacion + offsetSensibilidad[perfil.sensibilidad] + perfil.ajusteTermico
```

(Si sos friolento, el día "se siente" más frío para vos.)

**Niveles**

| tempEfectiva | Nivel | Superior | Inferior | Abrigo | Calzado |
| --- | --- | --- | --- | --- | --- |
| ≥ 27 | muy caluroso | abrigo 1 | short | ninguno | liviano |
| 22 a 27 | caluroso | abrigo 1 | short o pantalón liviano | ninguno | liviano |
| 17 a 22 | templado | abrigo 1 a 2 | pantalón | opcional nivel 2 | cerrado |
| 12 a 17 | fresco | abrigo 2 a 3 | pantalón | nivel 2 a 3 | cerrado |
| 6 a 12 | frío | abrigo 3 | pantalón | nivel 4 | cerrado |
| < 6 | muy frío | abrigo 3 a 4 | pantalón | nivel 5 + accesorios | cerrado |

**Reglas extra**

- Amplitud (`tempMax - tempMin`) ≥ 8°: sugerir capas y marcar el abrigo como "para sacarte al mediodía".
- `lluviaProb` ≥ 40%: el abrigo tiene que ser impermeable si hay alguno; alerta "llevá paraguas"; evitar calzado no impermeable si existe alternativa.
- `viento` ≥ 30 km/h: alerta de rompeviento.
- `uv` ≥ 6: alerta de anteojos, protector y gorra.

**Selección de prendas**

Para cada categoría requerida: filtrar prendas cuyo nivel de abrigo entre en el rango; entre las candidatas, elegir la de mejor puntaje de color (`lib/colores.js`) contra la paleta y contra las prendas ya elegidas; desempatar por menos usada. Si una categoría no tiene candidatas, devolver el texto genérico para esa categoría.

`textoGenerico` siempre se calcula, para usuarios sin placard o sin login.

## Colores (`lib/colores.js`)

- Convertir hex a HSL.
- Neutros: saturación < 15% o luminosidad < 12% o > 90%. Combinan con todo.
- Puntaje entre dos colores no neutros por distancia de tono:
  - análogos (≤ 30°): alto
  - complementarios (150° a 210°): alto
  - triádicos (≈ 120°): medio
  - resto: bajo
- Puntaje contra la paleta: el mejor puntaje entre el color de la prenda y cualquier color de la paleta.

## Clima (`lib/clima.js`)

- `buscarCiudad(nombre)` → `https://geocoding-api.open-meteo.com/v1/search?name=...&count=5&language=es`
- `getPronostico(lat, lon)` → `https://api.open-meteo.com/v1/forecast` con `hourly=temperature_2m,apparent_temperature,precipitation_probability,wind_speed_10m,uv_index,weather_code,is_day`, `timezone=auto`, `forecast_days` según necesidad.
- `resumirVentana(pronostico, horaSalida, horaVuelta)` → objeto `clima` del modelo de datos.
- `condicionPaleta(clima)` → clave de `paletas.clima` a partir de `weather_code`, `is_day` y temperatura.
- Cachear las llamadas con `fetch(..., { next: { revalidate: 1800 } })` cuando corren en servidor.

## Estructura de carpetas

```
app/
  (public)/
    page.js
    login/page.js
    registro/page.js
    paletas/page.js
    paletas/[clima]/page.js
  (private)/
    layout.js              // verifica sesión
    hoy/
    placard/
      page.js
      nueva/page.js
      [id]/page.js
      loading.js
      error.js
    historial/
    viajes/
    stats/
    perfil/
    admin/
  api/session/route.js
  layout.js
  not-found.js
components/
  ui/                      // Button, Input, Card, Badge, Modal
  clima/                   // ClimaResumen, Alertas, SelectorUbicacion
  placard/                 // PrendaCard, PrendaForm, FiltrosPlacard
  outfit/                  // OutfitSugerido, CalificarOutfit
  paletas/                 // PaletaSwatch
context/
  AuthContext.js
lib/
  firebase/client.js
  firebase/admin.js
  auth/session.js
  clima.js
  recomendar.js
  colores.js
  actions/                 // Server Actions por entidad
    prendas.js
    outfits.js
    viajes.js
    perfil.js
    paletas.js
scripts/
  seed.js                  // paletas + usuario de prueba con placard cargado
proxy.js
.env.example
```

## Variables de entorno (`.env.example`)

```
# Firebase cliente
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (servidor)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# Vercel Blob
BLOB_READ_WRITE_TOKEN=
```

## Orden de construcción

Cada fase termina con la app andando y un commit. No avanzar a la siguiente sin cerrar la anterior.

1. **Base.** `create-next-app` (JS, App Router, Tailwind), estructura de carpetas, layout raíz, `.env.example`, `.gitignore`. Deploy inicial en Vercel.
2. **Auth.** Firebase cliente y admin, registro y login (email + Google), session cookie, proxy, layout privado, `AuthContext`, logout. Documento `users/{uid}` creado al registrarse.
3. **Clima.** `lib/clima.js`, selector de ubicación con geolocalización y buscador, componente de resumen del clima en `/`.
4. **Motor.** `lib/colores.js` y `lib/recomendar.js` con recomendación genérica en `/`. Probar casos a mano (25° sol, 10° lluvia, amplitud alta).
5. **Placard.** ABM completo con Server Actions, validación, filtros, upload a Vercel Blob, estados de carga, error y vacío.
6. **Hoy.** `/hoy` con el outfit armado desde el placard, alertas, paleta y UI tematizada.
7. **Paletas.** Seed, `/paletas`, `/paletas/[clima]` con metadata dinámica y Open Graph.
8. **Historial.** Guardar outfit, calificar, ajuste térmico.
9. **Perfil.** Ciudad por defecto, horarios, sensibilidad.
10. **Admin.** Custom claim, `/admin` con ABM de paletas.
11. **Stats.** Dashboard con Recharts.
12. **Modo viaje.**
13. **Cierre.** Responsive, accesibilidad (teclado, contraste, alt en imágenes), dark mode, seed del usuario de prueba, README final.

## Opcionales de la consigna cubiertos

- Roles admin/user con panel de administración.
- Búsqueda, filtros y ordenamiento.
- Upload de imágenes.
- Dashboard con gráficos.
- SEO: Open Graph y metadata dinámica.
- Dark mode y accesibilidad cuidada.
- Interacción experimental: UI que cambia según el clima.

## README final (lo pide la consigna)

Nombre, propuesta en una oración, descripción, benchmark (Acloset o Whering, Coolors y una app de clima), tecnologías y decisiones técnicas, modelo de datos, mapa de navegación, opcionales, instalación, variables de entorno, usuario de prueba, capturas, consentimiento y reflexión sobre el uso de IA.
