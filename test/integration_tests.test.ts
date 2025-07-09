import { describe, expect, it } from "vitest";
import { ServiceOrchestrator } from "../src/runtime/services/service_orchestrator";

class MyService {
    constructor(
        public injected1: string,
        public injected2: number,
        public arg1: string,
        public arg2 = 41,
    ) {}
}

describe("Integration Tests", () => {
    it("should create an instance of MyService with the correct dependencies", () => {
        const orchestrator = new ServiceOrchestrator();
        orchestrator.setup((builder) => {
            builder.registerInstance("Injected1", "Hello");
            builder.registerInstance("Injected2", 42);

            builder.registerFactory(
                (injected1: string, injected2: number, arg1: string) => {
                    return new MyService(injected1, injected2, arg1, 100);
                },
                ["Injected1", "Injected2"],
                "MyService",
            );
        });

        const provider = orchestrator.getProvider();

        const myService = provider.resolve<MyService>("MyService", "World");

        expect(myService).toBeInstanceOf(MyService);
        expect(myService.injected1).toBe("Hello");
        expect(myService.injected2).toBe(42);
        expect(myService.arg1).toBe("World");
        expect(myService.arg2).toBe(100);
    });
});
