<script setup lang="ts">
import { setBlockTracking } from 'vue';
import { createService, createServiceAsync } from '../src/runtime/composables/use_service';

const config = useAppConfig();

const serviceB = await createServiceAsync("ServiceBFactory", config);
console.log('ServiceB', serviceB);

</script>

<template>
</template>