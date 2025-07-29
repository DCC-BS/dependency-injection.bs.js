import { type InjectKey } from "../helpers/helpers.js";
import type { IServiceFactory } from "./service_factory.js";
export interface ServiceType<T> {
    new (...args: any[]): T;
    $injectKey: string;
    $inject: (string | ServiceType<unknown>)[];
}
export interface IServiceProvider {
    resolve<T>(target: InjectKey<T>, ...args: any[]): T;
    resolveAsync<T>(target: InjectKey<T>, ...args: any[]): Promise<T>;
}
export declare class ServiceProvider extends Map<string, IServiceFactory<unknown>> implements IServiceProvider {
    resolve<T>(target: InjectKey<T>, ...args: any[]): T;
    resolveAsync<T>(target: InjectKey<T>, ...args: any[]): Promise<T>;
}
