import { describe, it, expect, beforeEach } from "vitest";
import { ServiceProviderBuilder } from "../src/service_provider_builder";

// filepath: src/service_dependency_builder.test.ts

// Mock service types for testing
class ServiceA {
    static $injectKey = "serviceA";

    // biome-ignore lint/complexity/noUselessConstructor: <explanation>
    constructor() {}
}

class ServiceB {
    static $injectKey = "serviceB";
    constructor(private readonly serviceA: ServiceA) {}
}

class ServiceC {
    static $injectKey = "serviceC";
    constructor(private readonly serviceB: ServiceB) {}
}

// Service with multiple dependencies
class ServiceD {
    static $injectKey = "serviceD";
    constructor(
        private readonly serviceA: ServiceA,
        private readonly serviceB: ServiceB,
    ) {}
}

// Services for circular dependency testing
class ServiceX {
    static $injectKey = "serviceX";
    constructor(private readonly serviceY: ServiceY) {}
}

class ServiceY {
    static $injectKey = "serviceY";
    constructor(private readonly serviceZ: ServiceZ) {}
}

class ServiceZ {
    static $injectKey = "serviceZ";
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
            builder.registerNamedInstance("CustomKey", customService);

            const provider = builder.build();
            expect(provider.resolveNamed("CustomKey")).toBe(customService);
        });

        it("should throw error when registering with duplicate name", () => {
            builder.registerNamedInstance("CustomKey", { name: "service1" });

            expect(() => {
                builder.registerNamedInstance("CustomKey", {
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

            const serviceB = provider.resolveNamed("serviceB");
            const serviceC = provider.resolveNamed("serviceC");

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
            const serviceD = provider.resolveNamed("serviceD");

            expect(serviceD).toBeInstanceOf(ServiceD);
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
