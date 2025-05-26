export default defineNuxtConfig({
    modules: ["../src/module"],
    plugins: ["~/plugins/test-plugin"],
    devtools: { enabled: true },
    compatibilityDate: "2025-02-17",
});
