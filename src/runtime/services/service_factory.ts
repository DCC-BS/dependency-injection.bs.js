import type { DependencyNode } from "./dependency_node";
import type { ServiceType } from "./service_provider";

export interface IServiceFactory<T> {
    build(...args: unknown[]): T;
}

export class ServiceFactory<T> {
    constructor(
        private readonly key: string,
        private readonly node: DependencyNode<T>,
        private readonly injectedFactories: IServiceFactory<unknown>[],
    ) {}

    public build(...args: unknown[]) {
        if (this.node.instance) {
            return this.node.instance as T;
        }

        if (!this.node.serviceType) {
            throw new Error(`Service type not found for service ${this.key}`);
        }

        const resovledServices = this.injectedFactories.map((service) =>
            service.build(),
        );

        let instance: T;

        if (this.node.isFactory) {
            const factoryType = this.node.serviceType as ServiceType<
                IServiceFactory<T>
            >;
            // Constructor parameters are typed per service; the resolved values are only known at runtime.
            const factory = new factoryType(...(resovledServices as never[]));

            instance = factory.build(...args);
        } else {
            instance = new this.node.serviceType(
                ...([...resovledServices, ...args] as never[]),
            ) as T;
        }

        if (this.node.lifetime === "singleton") {
            this.node.instance = instance;
        }

        return instance;
    }
}
