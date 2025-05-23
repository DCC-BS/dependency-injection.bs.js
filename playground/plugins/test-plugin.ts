import { defineNuxtPlugin } from "nuxt/app";
import d from "@dcc-bs/dependency-injection.bs.js";

export default defineNuxtPlugin((nuxtApp) => {    
    
    
    const orchestrator = new d.ServiceOrchestrator();

    nuxtApp.provide("serviceOrchestrator", orchestrator);
});
