// https://v3.nuxtjs.org/api/configuration/nuxt.config

export default defineNuxtConfig({
    modules: ['@nuxtjs/tailwindcss'],
    ssr: false,
    mode: "static",
    app: {
        head: {
            htmlAttrs: { "data-theme": "luxury", }
        }
    }
});