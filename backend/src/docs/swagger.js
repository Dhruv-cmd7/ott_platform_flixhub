const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'OTT Platform Backend API',
      version: '1.0.0',
      description: 'Production-ready REST API documentation for the MERN OTT Platform',
      contact: {
        name: 'Developer Support',
        email: 'support@ottplatform.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token to access protected user/admin routes.',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            status: { type: 'string', enum: ['active', 'suspended'] },
            activeSubscription: { type: 'string' },
          },
        },
        Movie: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            thumbnailUrl: { type: 'string' },
            bannerUrl: { type: 'string' },
            videoUrl: { type: 'string' },
            duration: { type: 'number' },
            releaseYear: { type: 'number' },
            isPublished: { type: 'boolean' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js'], // Scan routes for JSDoc documentation
};

const specs = swaggerJsdoc(options);

module.exports = specs;
