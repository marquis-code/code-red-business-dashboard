import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  postcss: {
    plugins: {
      "postcss-import": {},
      "tailwindcss/nesting": {},
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  plugins: ["~/plugins/aos.client.ts"],
  modules: ['@kevinmarrec/nuxt-pwa'],
  pwa: {
    workbox: {
      enabled: true
    },
    meta: {
      title: "Buildr",
      author: "Marquis",
      mobileAppIOS: false,
      mobileApp: true,
      description:
        "specialize in software development, product design, and bespoke solutions to help businesses innovate and thrive in the digital age.",
      theme_color: "#27396B",
      background_color: "#27396B",
      display: "standalone",
      start_url: "/",
      nativeUI: true,
    },
    icon: {
      sizes: [64, 120, 144, 152, 192, 384, 512],
    },
    manifest: {
      name: "Achilles Drill",
      lang: "fa",
      useWebmanifestExtension: false,
    },
    runtimeCaching: [
      {
        urlPattern: "https://fonts.googleapis.com/.*",
        handler: "cacheFirst",
        method: "GET",
        strategyOptions: { cacheableResponse: { statuses: [0, 200] } },
      },
      {
        urlPattern: "https://fonts.gstatic.com/.*",
        handler: "cacheFirst",
        method: "GET",
        strategyOptions: { cacheableResponse: { statuses: [0, 200] } },
      },
      {
        urlPattern: "https://cdn.snipcart.com/.*",
        method: "GET",
        strategyOptions: { cacheableResponse: { statuses: [0, 200] } },
      },
      {
        urlPattern:
          "https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js",
        handler: "cacheFirst",
        method: "GET",
        strategyOptions: { cacheableResponse: { statuses: [0, 200] } },
      },
    ],
  },
  vite: {
    optimizeDeps: {
      include: ['fast-deep-equal']
    }
  },
  // modules: [
  //   '@nuxtjs/pwa'
  // ],
  // pwa: {
  //   manifest: {
  //     name: 'My Awesome Nuxt 3 PWA',
  //     short_name: 'Nuxt3PWA',
  //     lang: 'en',
  //     useWebmanifestExtension: false,
  //     display: 'standalone',
  //     theme_color: '#4DBA87',
  //     background_color: '#000000'
  //   },
  //   workbox: {
  //     // Workbox options for customizing the service worker
  //   }
  // }
});
