import { beforeEach, describe, expect, it } from "vitest";
import { ServiceProviderBuilder } from "../src/runtime/services/service_provider_builder";

// filepath: src/service_dependency_builder.test.ts

// Mock service types for testing
class ServiceA {
    static $injectKey = "serviceA";
    static $inject: string[] = [];

    // biome-ignore lint/complexity/noUselessConstructor: <explanation>
    constructor() {}
}

class ServiceB {
    static $injectKey = "serviceB";
    static $inject = [ServiceA.$injectKey];

    constructor(private readonly serviceA: ServiceA) {}
}

class ServiceC {
    static $injectKey = "serviceC";
    static $inject = [ServiceB.$injectKey];

    constructor(private readonly serviceB: ServiceB) {}
}

// Service with multiple dependencies
class ServiceD {
    static $injectKey = "serviceD";
    static $inject = [ServiceA.$injectKey, ServiceB.$injectKey];

    constructor(
        private readonly serviceA: ServiceA,
        private readonly serviceB: ServiceB,
    ) {}
}

// Services for circular dependency testing
class ServiceX {
    static $injectKey = "serviceX";
    static $inject = ["serviceY"];

    constructor(private readonly serviceY: ServiceY) {}
}

class ServiceY {
    static $injectKey = "serviceY";
    static $inject = ["serviceZ"];

    constructor(private readonly serviceZ: ServiceZ) {}
}

class ServiceZ {
    static $injectKey = "serviceZ";
    static $inject = ["serviceX"];

    constructor(private readonly serviceX: ServiceX) {}
}

describe("ServiceProviderBuilder", () => {
    let builder: ServiceProviderBuilder;

    beforeEach(() => {
        builder = new ServiceProviderBuilder();
    });

    describe("registerInstance", () => {
        it("should register a service instance", () => {
            const serviceA = new ServiceA();
            builder.registerInstance(ServiceA, serviceA);

            const provider = builder.build();
            expect(provider.resolve(ServiceA)).toBe(serviceA);
        });

        it("should throw error when registering an instance with duplicate key", () => {
            const serviceA1 = new ServiceA();
            const serviceA2 = new ServiceA();

            builder.registerInstance(ServiceA, serviceA1);

            expect(() => {
                builder.registerInstance(ServiceA, serviceA2);
            }).toThrow("Service serviceA already registered");
        });
    });

    describe("registerNamedInstance", () => {
        it("should register a named instance", () => {
            const customService = { name: "CustomService" };
            builder.registerInstance("CustomKey", customService);

            const provider = builder.build();
            expect(provider.resolve("CustomKey")).toBe(customService);
        });

        it("should throw error when registering with duplicate name", () => {
            builder.registerInstance("CustomKey", { name: "service1" });

            expect(() => {
                builder.registerInstance("CustomKey", {
                    name: "service2",
                });
            }).toThrow("Service CustomKey already registered");
        });
    });

    describe("register", () => {
        it("should register a service type", () => {
            builder.register(ServiceA);

            // We verify it's registered by checking the dependency graph
            const graph = builder.getDependencyGraph();
            expect(graph).toHaveProperty("serviceA");
            expect(graph.serviceA).toEqual([]);
        });

        it("should throw error when registering a duplicate service", () => {
            builder.register(ServiceA);

            expect(() => {
                builder.register(ServiceA);
            }).toThrow("Service serviceA already registered");
        });

        it("should extract dependencies from constructor parameters", () => {
            builder.register(ServiceB);

            const graph = builder.getDependencyGraph();
            expect(graph.serviceB).toEqual(["serviceA"]);
        });
    });

    describe("build", () => {
        it("should build services with proper dependency order", () => {
            const serviceA = new ServiceA();
            builder.registerInstance(ServiceA, serviceA);
            builder.register(ServiceB);
            builder.register(ServiceC);

            const provider = builder.build();

            const serviceB = provider.resolve("serviceB");
            const serviceC = provider.resolve("serviceC");

            expect(serviceB).toBeInstanceOf(ServiceB);
            expect(serviceC).toBeInstanceOf(ServiceC);
        });

        it("should throw error on missing dependencies", () => {
            // Register ServiceB without ServiceA
            builder.register(ServiceB);

            expect(() => {
                builder.build();
            }).toThrow(
                "Service serviceB depends on serviceA, but serviceA is not registered",
            );
        });

        it("should throw error on circular dependencies", () => {
            builder.register(ServiceX);
            builder.register(ServiceY);
            builder.register(ServiceZ);

            expect(() => {
                builder.build();
            }).toThrow(/Circular dependency detected/);
        });

        it("should handle multiple dependencies correctly", () => {
            const serviceA = new ServiceA();
            builder.registerInstance(ServiceA, serviceA);
            builder.register(ServiceB);
            builder.register(ServiceD);

            const provider = builder.build();
            const serviceD = provider.resolve("serviceD");

            expect(serviceD).toBeInstanceOf(ServiceD);
        });
    });

    describe("registerFactory", () => {
        it("should register a factory function", () => {
            const serviceA = new ServiceA();
            builder.registerInstance(ServiceA, serviceA);

            const factoryKey = "factoryService";
            builder.registerFactory(
                (serviceA: ServiceA) => {
                    return { value: "created by factory", serviceA };
                },
                [ServiceA],
                factoryKey,
            );

            // Verify it's registered in the dependency graph
            const graph = builder.getDependencyGraph();
            expect(graph).toHaveProperty(factoryKey);
            expect(graph[factoryKey]).toEqual(["serviceA"]);

            // Build and verify the service is properly created
            const provider = builder.build();
            const factoryService = provider.resolve(factoryKey);

            expect(factoryService).toHaveProperty(
                "value",
                "created by factory",
            );
            expect(factoryService).toHaveProperty("serviceA", serviceA);
        });

        it("should throw error when registering a factory with duplicate key", () => {
            builder.registerFactory(
                () => ({ value: "first factory" }),
                [],
                "duplicateFactory",
            );

            expect(() => {
                builder.registerFactory(
                    () => ({ value: "second factory" }),
                    [],
                    "duplicateFactory",
                );
            }).toThrow("Service duplicateFactory already registered");
        });

        it("should properly inject dependencies into factory", () => {
            builder.register(ServiceA);
            builder.register(ServiceB);

            builder.registerFactory(
                (serviceA: ServiceA, serviceB: ServiceB) => {
                    return { serviceA, serviceB };
                },
                [ServiceA.$injectKey, ServiceB.$injectKey],
                "factoryWithMultipleDeps",
            );

            const provider = builder.build();
            const service = provider.resolve("factoryWithMultipleDeps") as {
                serviceA: ServiceA;
                serviceB: ServiceB;
            };

            expect(service.serviceA).toBeInstanceOf(ServiceA);
            expect(service.serviceB).toBeInstanceOf(ServiceB);
        });
    });

    describe("registerAsyncFactory", () => {
        it("should register an async factory function", async () => {
            const serviceA = new ServiceA();
            builder.registerInstance(ServiceA, serviceA);

            const asyncFactoryKey = "asyncFactoryService";
            builder.registerAsyncFactory(
                async (serviceA: ServiceA) => {
                    // Simulate async operation
                    return { value: "created by async factory", serviceA };
                },
                [ServiceA.$injectKey],
                asyncFactoryKey,
            );

            // Verify it's registered in the dependency graph
            const graph = builder.getDependencyGraph();
            expect(graph).toHaveProperty(asyncFactoryKey);
            expect(graph[asyncFactoryKey]).toEqual(["serviceA"]);

            // Build and verify the service is properly created
            const provider = builder.build();
            const asyncFactoryService = await provider.resolve(asyncFactoryKey);

            expect(asyncFactoryService).toHaveProperty(
                "value",
                "created by async factory",
            );
            expect(asyncFactoryService).toHaveProperty("serviceA", serviceA);
        });

        it("should throw error when registering an async factory with duplicate key", () => {
            builder.registerAsyncFactory(
                async () => ({ value: "first async factory" }),
                [],
                "duplicateAsyncFactory",
            );

            expect(() => {
                builder.registerAsyncFactory(
                    async () => ({ value: "second async factory" }),
                    [],
                    "duplicateAsyncFactory",
                );
            }).toThrow("Service duplicateAsyncFactory already registered");
        });

        it("should properly inject dependencies into async factory", async () => {
            builder.register(ServiceA);
            builder.register(ServiceB);

            builder.registerAsyncFactory(
                async (serviceA: ServiceA, serviceB: ServiceB) => {
                    return { serviceA, serviceB };
                },
                [ServiceA.$injectKey, ServiceB.$injectKey],
                "asyncFactoryWithMultipleDeps",
            );

            const provider = builder.build();
            const service = (await provider.resolve(
                "asyncFactoryWithMultipleDeps",
            )) as { serviceA: ServiceA; serviceB: ServiceB };

            expect(service.serviceA).toBeInstanceOf(ServiceA);
            expect(service.serviceB).toBeInstanceOf(ServiceB);
        });
    });

    describe("getDependencyGraph", () => {
        it("should return a dependency graph representation", () => {
            builder.register(ServiceA);
            builder.register(ServiceB);
            builder.register(ServiceC);
            builder.register(ServiceD);

            const graph = builder.getDependencyGraph();

            expect(graph).toEqual({
                serviceA: [],
                serviceB: ["serviceA"],
                serviceC: ["serviceB"],
                serviceD: ["serviceA", "serviceB"],
            });
        });
    });
});
