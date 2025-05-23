import { defineNuxtModule, createResolver, addImportsDir } from '@nuxt/kit';

const module = defineNuxtModule({
  meta: {
    name: "dependency-injection.bs.js",
    configKey: "dependency-injection.bs.js"
  },
  // Default configuration options of the Nuxt module
  defaults: {},
  setup(_options, _nuxt) {
    const resolver = createResolver(import.meta.url);
    addImportsDir(resolver.resolve("./runtime/composables"));
  }
});

export { module as default };
