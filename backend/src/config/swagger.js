import swaggerJsdoc from 'swagger-jsdoc';
import dotenv from 'dotenv';
dotenv.config();

const port = process.env.PORT || 5000;

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Deepfake Abuse Protection API',
            version: '1.0.0',
            description: 'API documentation for the Hackathon Project',
        },
        servers: [
            {
                url: `http://localhost:${port}/api`,
                description: 'Local Development Server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./src/routes/*.js'], // Path to the API docs
};

export const specs = swaggerJsdoc(options);
