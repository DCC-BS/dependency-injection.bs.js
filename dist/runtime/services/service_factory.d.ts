import type { DependencyNode } from "./dependency_node.js";
export interface IServiceFactory<T> {
    build(...args: any[]): T;
}
export declare class ServiceFactory<T> {
    private readonly key;
    private readonly node;
    private readonly injectedFactories;
    private instance;
    constructor(key: string, node: DependencyNode<T>, injectedFactories: IServiceFactory<unknown>[]);
    build(...args: any[]): T;
}
