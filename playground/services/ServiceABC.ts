import type { AppConfig } from "nuxt/schema";

export class ServiceA {
    static $injectKey = "ServiceA";
    static $inject = [];
}

export class ServiceB {
    static $injectKey = "ServiceB";
    static $inject = [ServiceA];

    constructor(
        public readonly serviceA: ServiceA,
        public readonly appConfig: AppConfig,
    ) {
        console.log("ServiceB initialized with ServiceA", serviceA, appConfig);
    }
}

export function getServiceB(serviceA: ServiceA, appConfig: AppConfig) {
    return new Promise<ServiceB>((resolve) => {
        resolve(new ServiceB(serviceA, appConfig));
    });
}

export class ServiceC {
    static $injectKey = "ServiceC";
    static $inject = [ServiceA, ServiceB];
    constructor(serviceA: ServiceA, serviceB: ServiceB) {
        console.log(
            "ServiceC initialized with ServiceA and ServiceB",
            serviceA,
            serviceB,
        );
    }
}
