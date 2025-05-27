<script setup lang="ts">
import { setBlockTracking } from 'vue';
import { createService, createServiceAsync } from '../src/runtime/composables/use_service';
import { ServiceB } from './services/ServiceABC';

const config = useAppConfig();

const serviceB = await createServiceAsync(ServiceB, config);
console.log('ServiceB', serviceB);

</script>

<template>
</template>