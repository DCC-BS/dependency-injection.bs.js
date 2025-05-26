export interface ServiceType<T> {
    new (...args: any[]): T;
    $injectKey: string;
    $inject: string[];
}
export interface IServiceProvider {
    resolve<T>(target: ServiceType<T>): T;
    resolveNamed<T>(key: string): T;
}
export declare class ServiceProvider extends Map<string, unknown> implements IServiceProvider {
    resolve<T>(target: ServiceType<T>): T;
    resolveNamed<T>(key: string): T;
}
