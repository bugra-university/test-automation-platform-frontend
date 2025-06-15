// Mock data for API Dashboard demonstration

// API Collections definition
export const apiCollections = [
    {
        id: "fleet-management",
        name: "Fleet Management Suite",
        description: "APIs for managing and tracking fleet vehicles and drivers",
        icon: "truck", // Lucide icon name
        apis: ["vehicle-tracking", "driver-management", "legacy-vehicle", "maintenance-scheduling"],
    },
    {
        id: "logistics",
        name: "Logistics Platform",
        description: "APIs for optimizing routes and managing logistics operations",
        icon: "map", // Lucide icon name
        apis: ["route-optimization"],
    },
    {
        id: "customer",
        name: "Customer Management",
        description: "APIs for managing customer data and interactions",
        icon: "users", // Lucide icon name
        apis: ["customer-api", "notification-api"],
    },
]

// API availability metrics data
export const availabilityMetrics = {
    "fleet-management": {
        overall: 99.87,
        environments: {
            production: 99.95,
            qa: 99.82,
            development: 99.65,
        },
        history: [
            { date: "2023-01", availability: 99.92 },
            { date: "2023-02", availability: 99.88 },
            { date: "2023-03", availability: 99.95 },
            { date: "2023-04", availability: 99.79 },
            { date: "2023-05", availability: 99.91 },
            { date: "2023-06", availability: 99.87 },
        ],
        incidents: [
            {
                id: "INC-001",
                date: "2023-04-15",
                duration: 45, // minutes
                environment: "production",
                description: "Database connection issues",
                impact: "Degraded performance for Vehicle Tracking API",
                resolution: "Scaled up database resources and optimized queries",
            },
            {
                id: "INC-002",
                date: "2023-06-02",
                duration: 20, // minutes
                environment: "qa",
                description: "Memory leak in API gateway",
                impact: "Intermittent 503 errors for Driver Management API",
                resolution: "Deployed hotfix to address memory management issue",
            },
        ],
    },
    logistics: {
        overall: 99.92,
        environments: {
            production: 99.98,
            qa: 99.85,
            development: 99.7,
        },
        history: [
            { date: "2023-01", availability: 99.95 },
            { date: "2023-02", availability: 99.91 },
            { date: "2023-03", availability: 99.94 },
            { date: "2023-04", availability: 99.98 },
            { date: "2023-05", availability: 99.9 },
            { date: "2023-06", availability: 99.92 },
        ],
        incidents: [
            {
                id: "INC-003",
                date: "2023-02-18",
                duration: 15, // minutes
                environment: "production",
                description: "CDN cache invalidation failure",
                impact: "Stale data served for Route Optimization API",
                resolution: "Manually purged CDN cache and fixed invalidation process",
            },
        ],
    },
    customer: {
        overall: 99.95,
        environments: {
            production: 99.99,
            qa: 99.9,
            development: 99.75,
        },
        history: [
            { date: "2023-01", availability: 99.97 },
            { date: "2023-02", availability: 99.99 },
            { date: "2023-03", availability: 99.98 },
            { date: "2023-04", availability: 99.95 },
            { date: "2023-05", availability: 99.93 },
            { date: "2023-06", availability: 99.95 },
        ],
        incidents: [],
    },
}

export const mockApis = [
    // Vehicle Tracking API - Current production version
    {
        id: "1",
        name: "Vehicle Tracking API",
        description: "Real-time tracking of vehicle locations and status",
        endpoint: "/api/vehicles/tracking",
        businessFunction: "Fleet Management",
        status: "running",
        environment: "production",
        cached: true,
        version: "2.3.1",
        deprecated: false,
        relatedApis: ["4", "7"],
        supportedMethods: ["GET", "POST", "PUT"],
        requestExamples: {
            POST: `{
  "vehicleId": "V-1234",
  "location": {
    "lat": 37.7749,
    "lng": -122.4194
  },
  "speed": 55,
  "direction": "N"
}`,
            PUT: `{
  "vehicleId": "V-1234",
  "status": "idle",
  "location": {
    "lat": 37.7749,
    "lng": -122.4194
  }
}`,
        },
        cacheLocation: {
            dev: "Redis Cluster (dev-cache-01)",
            prod: "Redis Cluster (prod-cache-03)",
        },
        cacheStructure: "Hash map with vehicle ID as key",
        dataSource: {
            type: "PostgreSQL",
            name: "fleet_tracking_db",
            description: "Primary database for vehicle tracking data",
        },
        owner: {
            name: "Jane Doe",
            username: "jdoexyz",
            email: "jane.doe@company.com",
            team: "Fleet Management Team",
            avatarUrl: "/abstract-geometric-shapes.png",
        },
        maintainers: [
            {
                name: "John Smith",
                username: "jsmixyz",
                email: "john.smith@company.com",
                role: "Backend Developer",
                avatarUrl: "/javascript-code.png",
            },
            {
                name: "Alice Johnson",
                username: "ajohxyz",
                email: "alice.johnson@company.com",
                role: "API Architect",
                avatarUrl: "/abstract-letter-aj.png",
            },
        ],
        lastUpdatedBy: {
            name: "John Smith",
            username: "jsmixyz",
        },
        lastUpdatedDate: "2023-05-15",
        releaseDate: "2023-05-15",
        changes: [
            "Added support for real-time location updates",
            "Improved error handling for network issues",
            "Enhanced performance for high-volume tracking",
        ],
        apiFamily: "vehicle-tracking",
        collectionId: "fleet-management",
        // New fields for deployment and versioning
        versioningStrategy: "url", // "url" or "header"
        deploymentStatus: {
            development: {
                isDeployed: true,
                servers: [
                    {
                        name: "dev-api-01",
                        fqdn: "dev-api-01.internal.truckgateway.com",
                        port: 8080,
                        version: "2.4.0-dev",
                        healthStatus: "healthy",
                        lastChecked: "2023-06-10T08:15:00Z",
                    },
                ],
                deployDate: "2023-06-05",
            },
            qa: {
                isDeployed: true,
                servers: [
                    {
                        name: "qa-api-01",
                        fqdn: "qa-api-01.internal.truckgateway.com",
                        port: 8080,
                        version: "2.3.1",
                        healthStatus: "healthy",
                        lastChecked: "2023-06-10T08:15:00Z",
                    },
                    {
                        name: "qa-api-02",
                        fqdn: "qa-api-02.internal.truckgateway.com",
                        port: 8080,
                        version: "2.3.1",
                        healthStatus: "healthy",
                        lastChecked: "2023-06-10T08:15:00Z",
                    },
                ],
                deployDate: "2023-05-18",
            },
            production: {
                isDeployed: true,
                servers: [
                    {
                        name: "prod-api-01",
                        fqdn: "api-01.truckgateway.com",
                        port: 443,
                        version: "2.3.1",
                        healthStatus: "healthy",
                        lastChecked: "2023-06-10T08:15:00Z",
                    },
                    {
                        name: "prod-api-02",
                        fqdn: "api-02.truckgateway.com",
                        port: 443,
                        version: "2.3.1",
                        healthStatus: "healthy",
                        lastChecked: "2023-06-10T08:15:00Z",
                    },
                    {
                        name: "prod-api-03",
                        fqdn: "api-03.truckgateway.com",
                        port: 443,
                        version: "2.3.1",
                        healthStatus: "healthy",
                        lastChecked: "2023-06-10T08:15:00Z",
                    },
                ],
                deployDate: "2023-05-22",
            },
        },
    },
    // Driver Management API
    {
        id: "2",
        name: "Driver Management API",
        description: "API for managing driver profiles, certifications, and assignments",
        endpoint: "/api/drivers",
        businessFunction: "Fleet Management",
        status: "running",
        environment: "production",
        cached: false,
        version: "1.8.5",
        deprecated: false,
        relatedApis: ["1"],
        supportedMethods: ["GET", "POST", "PUT", "DELETE"],
        requestExamples: {
            POST: `{
  "firstName": "John",
  "lastName": "Doe",
  "licenseNumber": "DL-98765",
  "licenseClass": "CDL-A",
  "certifications": ["Hazardous Materials", "Tanker"],
  "contactInfo": {
    "phone": "555-123-4567",
    "email": "john.doe@example.com"
  }
}`,
        },
        dataSource: {
            type: "MongoDB",
            name: "drivers_db",
            description: "Document store for driver profiles and certifications",
        },
        owner: {
            name: "Jane Doe",
            username: "jdoexyz",
            email: "jane.doe@company.com",
            team: "Fleet Management Team",
            avatarUrl: "/abstract-geometric-shapes.png",
        },
        maintainers: [
            {
                name: "Sarah Miller",
                username: "smilxyz",
                email: "sarah.miller@company.com",
                role: "Backend Developer",
                avatarUrl: "/abstract-pattern-sm.png",
            },
        ],
        lastUpdatedBy: {
            name: "Sarah Miller",
            username: "smilxyz",
        },
        lastUpdatedDate: "2023-04-02",
        releaseDate: "2023-04-03",
        changes: [
            "Added support for multiple driver certification types",
            "Implemented driver assignment history",
        ],
        apiFamily: "driver-management",
        collectionId: "fleet-management",
        // New fields for deployment and versioning
        versioningStrategy: "header", // "url" or "header"
        deploymentStatus: {
            development: {
                isDeployed: true,
                servers: [
                    {
                        name: "dev-api-01",
                        fqdn: "dev-api-01.internal.truckgateway.com",
                        port: 8082,
                        version: "1.9.0-dev",
                        healthStatus: "healthy",
                        lastChecked: "2023-06-10T08:15:00Z",
                    },
                ],
                deployDate: "2023-05-28",
            },
            qa: {
                isDeployed: true,
                servers: [
                    {
                        name: "qa-api-01",
                        fqdn: "qa-api-01.internal.truckgateway.com",
                        port: 8082,
                        version: "1.8.5",
                        healthStatus: "healthy",
                        lastChecked: "2023-06-10T08:15:00Z",
                    },
                ],
                deployDate: "2023-03-25",
            },
            production: {
                isDeployed: true,
                servers: [
                    {
                        name: "prod-api-01",
                        fqdn: "api-01.truckgateway.com",
                        port: 443,
                        version: "1.8.5",
                        healthStatus: "healthy",
                        lastChecked: "2023-06-10T08:15:00Z",
                    },
                    {
                        name: "prod-api-02",
                        fqdn: "api-02.truckgateway.com",
                        port: 443,
                        version: "1.8.5",
                        healthStatus: "healthy",
                        lastChecked: "2023-06-10T08:15:00Z",
                    },
                ],
                deployDate: "2023-04-03",
            },
        },
    },
    // Legacy Vehicle API
    {
        id: "3",
        name: "Legacy Vehicle API",
        description: "Legacy API for older fleet management systems",
        endpoint: "/api/v1/vehicles",
        businessFunction: "Fleet Management",
        status: "running",
        environment: "production",
        cached: false,
        version: "1.2.0",
        deprecated: true,
        relatedApis: ["1"],
        supportedMethods: ["GET", "POST"],
        requestExamples: {},
        dataSource: {
            type: "Oracle",
            name: "legacy_fleet_db",
            description: "Legacy Oracle database for fleet data",
        },
        owner: {
            name: "Jane Doe",
            username: "jdoexyz",
            email: "jane.doe@company.com",
            team: "Fleet Management Team",
            avatarUrl: "/abstract-geometric-shapes.png",
        },
        maintainers: [
            {
                name: "Robert Chen",
                username: "rchenxyz",
                email: "robert.chen@company.com",
                role: "Legacy Systems Engineer",
                avatarUrl: "/abstract-pattern-rc.png",
            },
        ],
        lastUpdatedBy: {
            name: "Robert Chen",
            username: "rchenxyz",
        },
        lastUpdatedDate: "2022-11-15",
        releaseDate: "2021-06-10",
        changes: [
            "Security patch for authentication",
            "Minor bug fixes",
        ],
        apiFamily: "legacy-vehicle",
        collectionId: "fleet-management",
        // New fields for deployment and versioning
        versioningStrategy: "url", // "url" or "header"
        deploymentStatus: {
            development: {
                isDeployed: false,
                servers: [],
                deployDate: null,
            },
            qa: {
                isDeployed: true,
                servers: [
                    {
                        name: "qa-legacy-01",
                        fqdn: "qa-legacy-01.internal.truckgateway.com",
                        port: 8082,
                        version: "1.2.0",
                        healthStatus: "healthy",
                        lastChecked: "2023-06-10T08:15:00Z",
                    },
                ],
                deployDate: "2022-11-10",
            },
            production: {
                isDeployed: true,
                servers: [
                    {
                        name: "prod-legacy-01",
                        fqdn: "legacy-api.truckgateway.com",
                        port: 443,
                        version: "1.2.0",
                        healthStatus: "healthy",
                        lastChecked: "2023-06-10T08:15:00Z",
                    },
                ],
                deployDate: "2022-11-20",
            },
        },
    },
    // Maintenance Scheduling API
    {
        id: "4",
        name: "Maintenance Scheduling API",
        description: "API for scheduling and tracking vehicle maintenance",
        endpoint: "/api/maintenance",
        businessFunction: "Fleet Management",
        status: "degraded",
        environment: "production",
        cached: true,
        version: "1.5.2",
        deprecated: false,
        relatedApis: ["1"],
        supportedMethods: ["GET", "POST", "PUT"],
        requestExamples: {
            POST: `{
  "vehicleId": "V-1234",
  "maintenanceType": "oil_change",
  "scheduledDate": "2023-07-15",
  "estimatedDuration": 60,
  "notifyDriver": true
}`,
        },
        cacheLocation: {
            dev: "Redis Cluster (dev-cache-01)",
            prod: "Redis Cluster (prod-cache-02)",
        },
        cacheStructure: "Keys with vehicle ID and maintenance type",
        dataSource: {
            type: "PostgreSQL",
            name: "maintenance_db",
            description: "Database for maintenance records and schedules",
        },
        owner: {
            name: "Michael Wong",
            username: "mwongxyz",
            email: "michael.wong@company.com",
            team: "Vehicle Services Team",
            avatarUrl: "/abstract-pattern-mw.png",
        },
        maintainers: [
            {
                name: "Emily Davis",
                username: "edavisxyz",
                email: "emily.davis@company.com",
                role: "Full Stack Developer",
                avatarUrl: "/abstract-pattern-ed.png",
            },
        ],
        lastUpdatedBy: {
            name: "Emily Davis",
            username: "edavisxyz",
        },
        lastUpdatedDate: "2023-05-28",
        releaseDate: "2023-05-30",
        changes: [
            "Added notification preferences for maintenance events",
            "Improved scheduling algorithm for maintenance slots",
        ],
        apiFamily: "maintenance-scheduling",
        collectionId: "fleet-management",
        // New fields for deployment and versioning
        versioningStrategy: "url", // "url" or "header"
        deploymentStatus: {
            development: {
                isDeployed: true,
                servers: [{
                    name: "dev-api-02",
                    fqdn: "dev-api-02.internal.truckgateway.com",
                    port: 8080,
                    version: "1.6.0-dev",
                    healthStatus: "healthy",
                    lastChecked: "2023-06-10T08:15:00Z",
                },
                ],
                deployDate: "2023-06-01",
            },
            qa: {
                isDeployed: true,
                servers: [{
                    name: "qa-api-02",
                    fqdn: "qa-api-02.internal.truckgateway.com",
                    port: 8080,
                    version: "1.5.2",
                    healthStatus: "healthy",
                    lastChecked: "2023-06-10T08:15:00Z",
                },
                ],
                deployDate: "2023-05-25",
            },
            production: {
                isDeployed: true,
                servers: [
                    {
                        name: "prod-api-01",
                        fqdn: "api-01.truckgateway.com",
                        port: 443,
                        version: "1.5.2",
                        healthStatus: "degraded",
                        lastChecked: "2023-06-10T08:15:00Z",
                    },
                    {
                        name: "prod-api-02",
                        fqdn: "api-02.truckgateway.com",
                        port: 443,
                        version: "1.5.2",
                        healthStatus: "healthy",
                        lastChecked: "2023-06-10T08:15:00Z",
                    },
                ],
                deployDate: "2023-05-30",
            },
        },
    },
    // Route Optimization API
    {
        id: "5",
        name: "Route Optimization API",
        description: "API for calculating optimal delivery routes",
        endpoint: "/api/routes/optimize",
        businessFunction: "Logistics",
        status: "running",
        environment: "production",
        cached: false,
        version: "3.1.0",
        deprecated: false,
        relatedApis: ["1"],
        supportedMethods: ["POST"],
        requestExamples: {
            POST: `{
  "origin": {"lat": 37.7749, "lng": -122.4194},
  "destinations": [
    {"lat": 37.3382, "lng": -121.8863, "priority": "high"},
    {"lat": 37.4275, "lng": -122.1697, "priority": "medium"},
    {"lat": 37.7749, "lng": -122.4194, "priority": "low"}
  ],
  "vehicleType": "delivery_van",
  "avoidHighways": false,
  "departureTime": "2023-06-15T08:00:00Z"
}`,
        },
        dataSource: {
            type: "Custom",
            name: "routing_engine",
            description: "Proprietary routing and optimization engine",
        },
        owner: {
            name: "Lisa Park",
            username: "lparkxyz",
            email: "lisa.park@company.com",
            team: "Route Optimization Team",
            avatarUrl: "/abstract-pattern-lp.png",
        },
        maintainers: [
            {
                name: "David Johnson",
                username: "djohnxyz",
                email: "david.johnson@company.com",
                role: "Algorithm Specialist",
                avatarUrl: "/abstract-pattern-dj.png",
            },
            {
                name: "Maria Rodriguez",
                username: "mrodxyz",
                email: "maria.rodriguez@company.com",
                role: "Backend Developer",
                avatarUrl: "/abstract-pattern-mr.png",
            },
        ],
        lastUpdatedBy: {
            name: "Maria Rodriguez",
            username: "mrodxyz",
        },
        lastUpdatedDate: "2023-06-01",
        releaseDate: "2023-06-05",
        changes: [
            "Added support for multiple vehicle types",
            "Improved optimization algorithm for multi-stop routes",
            "Added traffic prediction based on historical data",
        ],
        apiFamily: "route-optimization",
        collectionId: "logistics",
        // New fields for deployment and versioning
        versioningStrategy: "url", // "url" or "header"
        deploymentStatus: {
            development: {
                isDeployed: true,
                servers: [
                    {
                        name: "dev-routes-01",
                        fqdn: "dev-routes-01.internal.truckgateway.com",
                        port: 8090,
                        version: "3.2.0-dev",
                        healthStatus: "healthy",
                        lastChecked: "2023-06-10T08:15:00Z",
                    },
                ],
                deployDate: "2023-06-08",
            },
            qa: {
                isDeployed: true,
                servers: [
                    {
                        name: "qa-routes-01",
                        fqdn: "qa-routes-01.internal.truckgateway.com",
                        port: 8090,
                        version: "3.1.0",
                        healthStatus: "healthy",
                        lastChecked: "2023-06-10T08:15:00Z",
                    },
                ],
                deployDate: "2023-05-30",
            },
            production: {
                isDeployed: true,
                servers: [
                    {
                        name: "prod-routes-01",
                        fqdn: "routes-01.truckgateway.com",
                        port: 443,
                        version: "3.1.0",
                        healthStatus: "healthy",
                        lastChecked: "2023-06-10T08:15:00Z",
                    },
                    {
                        name: "prod-routes-02",
                        fqdn: "routes-02.truckgateway.com",
                        port: 443,
                        version: "3.1.0",
                        healthStatus: "healthy",
                        lastChecked: "2023-06-10T08:15:00Z",
                    },
                ],
                deployDate: "2023-06-05",
            },
        },
    },
    // Customer API
    {
        id: "6",
        name: "Customer API",
        description: "API for managing customer data and accounts",
        endpoint: "/api/customers",
        businessFunction: "Customer Management",
        status: "running",
        environment: "production",
        cached: true,
        version: "2.0.1",
        deprecated: false,
        relatedApis: ["7"],
        supportedMethods: ["GET", "POST", "PUT", "DELETE"],
        requestExamples: {
            POST: `{
  "name": "Acme Corporation",
  "type": "business",
  "contactPerson": {
    "firstName": "John",
    "lastName": "Smith",
    "email": "john.smith@acme.com",
    "phone": "555-123-4567"
  },
  "billingAddress": {
    "street": "123 Business Ave",
    "city": "San Francisco",
    "state": "CA",
    "zip": "94107",
    "country": "USA"
  },
  "accountDetails": {
    "paymentTerms": "net30",
    "creditLimit": 10000
  }
}`,
        },
        cacheLocation: {
            dev: "Redis Cluster (dev-cache-02)",
            prod: "Redis Cluster (prod-cache-01)",
        },
        cacheStructure: "Hash map with customer ID as key",
        dataSource: {
            type: "PostgreSQL",
            name: "customer_db",
            description: "Primary customer database",
        },
        owner: {
            name: "Susan Miller",
            username: "smillxyz",
            email: "susan.miller@company.com",
            team: "Customer Experience Team",
            avatarUrl: "/abstract-pattern-sm.png",
        },
        maintainers: [
            {
                name: "Tom Wilson",
                username: "twilsxyz",
                email: "tom.wilson@company.com",
                role: "Backend Developer",
                avatarUrl: "/abstract-pattern-tw.png",
            },
        ],
        lastUpdatedBy: {
            name: "Tom Wilson",
            username: "twilsxyz",
        },
        lastUpdatedDate: "2023-05-10",
        releaseDate: "2023-05-15",
        changes: [
            "Added support for multiple billing addresses",
            "Enhanced customer segmentation capabilities",
            "Improved GDPR compliance features",
        ],
        apiFamily: "customer-api",
        collectionId: "customer",
        // New fields for deployment and versioning
        versioningStrategy: "header", // "url" or "header"
        deploymentStatus: {
            development: {
                isDeployed: true,
                servers: [
                    {
                        name: "dev-customer-01",
                        fqdn: "dev-customer-01.internal.truckgateway.com",
                        port: 8091,
                        version: "2.1.0-dev",
                        healthStatus: "healthy",
                        lastChecked: "2023-06-10T08:15:00Z",
                    },
                ],
                deployDate: "2023-05-25",
            },
            qa: {
                isDeployed: true,
                servers: [
                    {
                        name: "qa-customer-01",
                        fqdn: "qa-customer-01.internal.truckgateway.com",
                        port: 8091,
                        version: "2.0.1",
                        healthStatus: "healthy",
                        lastChecked: "2023-06-10T08:15:00Z",
                    },
                ],
                deployDate: "2023-05-08",
            },
            production: {
                isDeployed: true,
                servers: [
                    {
                        name: "prod-customer-01",
                        fqdn: "customer-01.truckgateway.com",
                        port: 443,
                        version: "2.0.1",
                        healthStatus: "healthy",
                        lastChecked: "2023-06-10T08:15:00Z",
                    },
                    {
                        name: "prod-customer-02",
                        fqdn: "customer-02.truckgateway.com",
                        port: 443,
                        version: "2.0.1",
                        healthStatus: "healthy",
                        lastChecked: "2023-06-10T08:15:00Z",
                    },
                ],
                deployDate: "2023-05-15",
            },
        },
    },
    // Notification API
    {
        id: "7",
        name: "Notification API",
        description: "API for sending notifications to customers and drivers",
        endpoint: "/api/notifications",
        businessFunction: "Customer Management",
        status: "stopped",
        environment: "qa",
        cached: false,
        version: "1.3.0",
        deprecated: false,
        relatedApis: ["6", "2"],
        supportedMethods: ["POST"],
        requestExamples: {
            POST: `{
  "recipient": {
    "type": "customer",
    "id": "C-5678"
  },
  "channel": "email",
  "template": "delivery_confirmation",
  "data": {
    "orderNumber": "ORD-98765",
    "deliveryDate": "2023-06-15",
    "items": [
      {"name": "Widget A", "quantity": 5},
      {"name": "Widget B", "quantity": 2}
    ]
  }
}`,
        },
        dataSource: {
            type: "MongoDB",
            name: "notifications_db",
            description: "Document store for notification templates and logs",
        },
        owner: {
            name: "Susan Miller",
            username: "smillxyz",
            email: "susan.miller@company.com",
            team: "Customer Experience Team",
            avatarUrl: "/abstract-pattern-sm.png",
        },
        maintainers: [
            {
                name: "Jennifer Lee",
                username: "jleexyz",
                email: "jennifer.lee@company.com",
                role: "Full Stack Developer",
                avatarUrl: "/abstract-pattern-jl.png",
            },
        ],
        lastUpdatedBy: {
            name: "Jennifer Lee",
            username: "jleexyz",
        },
        lastUpdatedDate: "2023-06-08",
        releaseDate: null, // Not yet released to production
        changes: [
            "Added support for SMS notifications",
            "Enhanced template personalization options",
            "Integrated with new email delivery service",
        ],
        apiFamily: "notification-api",
        collectionId: "customer",
        // New fields for deployment and versioning
        versioningStrategy: "url", // "url" or "header"
        deploymentStatus: {
            development: {
                isDeployed: true,
                servers: [
                    {
                        name: "dev-notify-01",
                        fqdn: "dev-notify-01.internal.truckgateway.com",
                        port: 8092,
                        version: "1.3.0-dev",
                        healthStatus: "healthy",
                        lastChecked: "2023-06-10T08:15:00Z",
                    },
                ],
                deployDate: "2023-06-01",
            },
            qa: {
                isDeployed: true,
                servers: [
                    {
                        name: "qa-notify-01",
                        fqdn: "qa-notify-01.internal.truckgateway.com",
                        port: 8092,
                        version: "1.3.0",
                        healthStatus: "stopped",
                        lastChecked: "2023-06-10T08:15:00Z",
                    },
                ],
                deployDate: "2023-06-05",
            },
            production: {
                isDeployed: false,
                servers: [],
                deployDate: null, // Not yet deployed to production
            },
        },
    },
]

// Utility function to group APIs by family
export function groupApisByFamily(apis: typeof mockApis) {
    const families = {} as Record<string, typeof mockApis>;

    apis.forEach(api => {
        if (!families[api.apiFamily]) {
            families[api.apiFamily] = [];
        }
        families[api.apiFamily].push(api);
    });

    return families;
}
