import {
    addImportsDir,
    addTypeTemplate,
    createResolver,
    defineNuxtModule,
} from "@nuxt/kit";

export default defineNuxtModule({
    meta: {
        name: "dependency-injection.bs.js",
        configKey: "dependency-injection.bs.js",
    },
    // Default configuration options of the Nuxt module
    defaults: {},
    setup(_options, _nuxt) {
        const resolver = createResolver(import.meta.url);

        // Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`

        // examples:
        addImportsDir(resolver.resolve("./runtime/composables"));
        addImportsDir(resolver.resolve("./runtime/services"));
    },
});
