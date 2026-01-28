<script setup lang="ts">
import { useServiceAsync } from "../src/runtime/composables/use_service";
import { ServiceB } from "./services/ServiceABC";

const config = useAppConfig();

const serviceB = await useServiceAsync(ServiceB, config);
console.log("ServiceB", serviceB);
</script>

<template>
</template>