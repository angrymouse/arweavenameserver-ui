// https://v3.nuxtjs.org/api/configuration/nuxt.config
import vitePluginRequire from "vite-plugin-require";
export default defineNuxtConfig({
    modules: ['@nuxtjs/tailwindcss'],
    ssr: false,
    target: "static",
    mode: "spa",

    app: {
        head: {
            htmlAttrs: { "data-theme": "luxury", }
        }
    }
});