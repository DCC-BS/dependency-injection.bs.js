/**
 * Example usage and testing for the ServiceDependencyBuilder
 */

import { ServiceProviderBuilder } from './service_dependency_builder';
import type { ServiceType } from './service_provider';

// Example service classes for testing

class DatabaseService {
    static $injectKey = 'DatabaseService';
    
    constructor() {
        console.log('Creating DatabaseService');
    }
}

class LoggerService {
    static $injectKey = 'LoggerService';
    
    constructor() {
        console.log('Creating LoggerService');
    }
}

class UserRepository {
    static $injectKey = 'UserRepository';
    
    constructor(
        private readonly db: DatabaseService,
        private readonly logger: LoggerService
    ) {
        console.log('Creating UserRepository with dependencies');
    }
}

class AuthService {
    static $injectKey = 'AuthService';
    
    constructor(
        private readonly userRepo: UserRepository,
        private readonly logger: LoggerService
    ) {
        console.log('Creating AuthService with dependencies');
    }
}

/**
 * Example function that demonstrates how to use the ServiceDependencyBuilder
 */
function setupServices() {
    const builder = new ServiceProviderBuilder();
    
    // Register services
    const logger = new LoggerService();
    builder.registerInstance(LoggerService as ServiceType<LoggerService>, logger);
    
    const db = new DatabaseService();
    builder.registerInstance(DatabaseService as ServiceType<DatabaseService>, db);
    
    // Register services with dependencies
    builder.register(UserRepository as ServiceType<UserRepository>);
    builder.register(AuthService as ServiceType<AuthService>);
    
    // Get dependency graph for visualization
    const graph = builder.getDependencyGraph();
    console.log('Dependency Graph:', JSON.stringify(graph, null, 2));
    
    try {
        // Build all services, validating dependencies
        const instances = builder.build();
        console.log('Successfully built services');
        
        // Access any service
        const authService = instances.get('AuthService');
        console.log('AuthService instance:', authService);
        
        return instances;
    } catch (error) {
        console.error('Failed to build services:', error);
        throw error;
    }
}

// Example of circular dependency detection
function setupCircularDependencies() {
    class ServiceA {
        static $injectKey = 'ServiceA';
        constructor(private readonly b: any) {}
    }
    
    class ServiceB {
        static $injectKey = 'ServiceB';
        constructor(private readonly a: any) {}
    }
    
    const builder = new ServiceProviderBuilder();
    
    builder.register(ServiceA as ServiceType<ServiceA>);
    builder.register(ServiceB as ServiceType<ServiceB>);
    
    try {
        builder.build();
    } catch (error) {
        console.error('Circular dependency detected (expected):', error);
    }
}

/**
 * Run the test examples
 * This can be executed in a test environment or from the console
 */
export function runTests() {
    console.log('=== Testing normal service registration and building ===');
    setupServices();
    
    console.log('\n=== Testing circular dependency detection ===');
    setupCircularDependencies();
}
