export interface ServiceType<T> {
    new (...args: any[]): T;
    $injectKey: string;
    $inject: (string | ServiceType<unknown>)[];
}
export interface IServiceProvider {
    resolve<T>(target: ServiceType<T>): T;
    resolveNamed<T>(key: string): T;
    resolveFactory<T>(target: string, ...args: any): T;
    resolveFactoryAsync<T>(target: string, ...args: any): Promise<T>;
}
export declare class ServiceProvider extends Map<string, unknown> implements IServiceProvider {
    resolve<T>(target: ServiceType<T>): T;
    resolveFactory<T>(target: string, ...args: any[]): T;
    resolveFactoryAsync<T>(target: string, ...args: any[]): Promise<T>;
    resolveNamed<T>(key: string): T;
}
