# Dependency Injection

A lightweight, type-safe dependency injection system for JavaScript/TypeScript applications, with built-in support for Nuxt.js.

![GitHub License](https://img.shields.io/github/license/DCC-BS/dependency-injection.bs.js)
[![Checked with Biome](https://img.shields.io/badge/Checked_with-Biome-60a5fa?style=flat&logo=biome)](https://biomejs.dev)
[![NPM Version](https://img.shields.io/npm/v/%40dcc-bs%2Fdependency-injection.bs.js)](https://www.npmjs.com/package/@dcc-bs/dependency-injection.bs.js)

## Features

- Type-safe dependency resolution and injection
- Automatic dependency detection through constructor parameters
- Circular dependency detection
- Topological sorting of dependencies for proper initialization order
- Built-in integration with Nuxt.js
- Easily register existing instances or have them created automatically
- Supports named services for more flexible registration

## Installation
Add this line to your package.json dependencies. Replace #v1.0.0 with the desired version.

```json
{
  "dependencies": {
    "@dcc-bs/dependency-injection.bs.js": "git+https://github.com/DCC-BS/dependency-injection.bs.js.git#v1.0.0",
  }
}
```

run npm install or yarn install to install the package.

```bash
# Using npm
npm

# Using yarn
yarn

# Using bun
bun install
```

## Usage

### Basic Example

```typescript
import { ServiceProviderBuilder } from '@dcc-bs/dependency-injection.bs.js';

// Define your services with injection keys
class DatabaseService {
  static $injectKey = 'DatabaseService';
  static $inject = []; // No dependencies
  
  connect() {
    console.log('Database connected');
  }
}

class UserRepository {
  static $injectKey = 'UserRepository';
  static $inject = [DatabaseService.$injectKey]; // This service depends on DatabaseService
  
  // to get services injected, the name of the constructor parameter need to macht the injectKey
  constructor(private readonly databaseService: DatabaseService) {}
  
  getUsers() {
    // Uses the injected database service
    this.db.connect();
    return ['user1', 'user2'];
  }
}

class UserService {
  static $injectKey = 'UserService';
  static $inject = ["UserRepository"]; // you can also simply provide the inject key as a string
  
  constructor(private readonly userRepository: UserRepository) {}
  
  getAllUsers() {
    return this.userRepository.getUsers();
  }
}

// Set up the service provider
const builder = new ServiceProviderBuilder();

// Register services
builder.register(DatabaseService);
builder.register(UserRepository);
builder.register(UserService);

// Build the service provider
const serviceProvider = builder.build();

// Resolve services
const userService = serviceProvider.resolve(UserService);
console.log(userService.getAllUsers()); // ['user1', 'user2']
```

### Registering Existing Instances

```typescript
// Register an existing instance
const db = new DatabaseService();
builder.registerInstance(DatabaseService, db);

// Register a named instance
builder.registerInstance('config', { apiUrl: 'https://api.example.com' });
```

### Using with Nuxt.js

This package provides built-in Nuxt.js integration:

Register the module:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@dcc-bs/dependency-injection.bs.js'],
});
```

Create a plugin:

```typescript
// plugins/service-registrant.ts
export default defineNuxtPlugin((nuxtApp) => {
    const orchestrator = new ServiceOrchestrator();

    // the setup will be lazily called the first time a 
    // service is resolved, ensuring services are created
    // in the Vue component lifecycle or setup context.
    orchestrator.setup((builder) => {
        const logger = useLogger();
        const { t } = useI18n(); // this needs to be created in the setup context

        builder.registerInstance("translate", t);
        builder.registerInstance("logger", logger);

        builder.register(DatabaseService);
        builder.register(UserRepository);
        builder.register(UserService);

        // Register a service factory, which allows creating instances with custom parameters
        // you can mix injected services and custom parameters,
        // but the injected services must be before the custom parameters in the factory function
        builder.registerFactory("ServiceWithFactory", (injected1, param1, param2) => {
            return new SomeService(injected1, param1, param2);
        });

        builder.registerFactoryAsync("AsyncService", async (injected1, param1, param2) => {
            const result = await fetchSomeData(injected1, param1, param2);
            return new AsyncService(result);
        });
    });

    nuxtApp.provide("serviceOrchestrator", orchestrator);
});
```

Use the plugin in a component or a composable:

```typescript
<script lang="ts" setup>
// For resolving registered service types
const databaseService = useService(DatabaseService);

// For creating service instances with custom parameters
const customService = createService("ServiceWithFactory", param1, param2);

// For creating service instances asynchronously
const asyncService = await createServiceAsync("AsyncService", param1, param2);
</script>
```

## API Reference

### ServiceProviderBuilder

The main class for registering and constructing services.

#### Methods

- `register<T>(target: ServiceType<T>)`: Register a service type for later instantiation
- `registerInstance<T>(target: ServiceType<T>, instance: T)`: Register an existing service instance
- `registerNamedInstance<T>(name: string, instance: T)`: Register a named service instance
- `build()`: Build and return the service provider
- `getDependencyGraph()`: Get a map of service dependencies for debugging

### IServiceProvider

Interface for resolving services from the container.

#### Methods

- `resolve<T>(target: ServiceType<T>)`: Resolve a service by its type
- `resolveNamed<T>(name: string)`: Resolve a service by its name
- `resolveFactory<T>(target: string, ...args: any)`: Create and resolve a service with custom parameters
- `resolveFactoryAsync<T>(target: string, ...args: any)`: Asynchronously create and resolve a service

### ServiceOrchestrator

Manages service providers for Nuxt.js integration.

#### Methods

- `setup(builderFactory)`: Set up the service orchestrator with a factory function to configure the service provider
- `getProvider()`: Get the service provider instance (creates it lazily if not yet created)

### Nuxt.js Composables

Conveniences for using the dependency injection system in Nuxt.js applications.

- `useService<T>(target: ServiceType<T>)`: Resolve a service by its type
- `createService<T>(target: string, ...args)`: Create and resolve a service with custom parameters
- `createServiceAsync<T>(target: string, ...args)`: Asynchronously create and resolve a service

## Advanced Usage

### Visualizing Dependencies

```typescript
const builder = new ServiceProviderBuilder();
// Register services...

// Get the dependency graph for visualization or debugging
const graph = builder.getDependencyGraph();
console.log(graph);
// { 
//   'databaseService': [],
//   'userRepository': ['databaseService'],
//   'userService': ['userRepository']
// }
```

### Handling Circular Dependencies

The library automatically detects circular dependencies and throws a descriptive error:

```typescript
// This would throw: "Circular dependency detected: serviceX -> serviceY -> serviceZ -> serviceX"
builder.register(ServiceX);
builder.register(ServiceY);
builder.register(ServiceZ);
builder.build();
```

## License

MIT


<a href="https://www.bs.ch/schwerpunkte/daten/databs/schwerpunkte/datenwissenschaften-und-ki"><img src="https://github.com/DCC-BS/.github/blob/main/_imgs/databs_log.png?raw=true" alt="DCC Logo" width="200" /></a>

Datenwissenschaften und KI <br>
Developed with ❤️ by Data Alchemy Team
