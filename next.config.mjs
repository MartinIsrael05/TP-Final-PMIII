/** @type {import('next').NextConfig} */
const nextConfig = {
  // Dejamos cacheComponents desactivado (el default de create-next-app lo
  // activa). Con el modelo clásico de caché podemos leer la cookie de sesión
  // en el layout privado y cachear el clima con fetch + revalidate, que es
  // más simple de explicar.
  // Las fotos de las prendas viven en Vercel Blob; next/image necesita
  // saber de qué dominio puede optimizarlas.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
