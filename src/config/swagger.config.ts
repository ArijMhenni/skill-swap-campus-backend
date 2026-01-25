import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Skill Swap Campus API')
    .setDescription(
      'API documentation for Skill Swap Campus platform - A platform for students to exchange skills and knowledge',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', 
    )
    .addTag('Authentication', 'Authentication endpoints - Register and Login')
    .addTag('Users', 'User management endpoints - Profile and user data')
    .addTag('Skills', 'Skills management endpoints')
    .addServer('http://localhost:3000', 'Development Server')
    .addServer('https://api.skillswap.com', 'Production Server')
    .setContact(
      'Skill Swap Campus Team',
      'https://skillswap.com',
      'support@skillswap.com',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  // Setup Swagger UI at /api/docs
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // Keep authorization after page refresh
      tagsSorter: 'alpha', // Sort tags alphabetically
      operationsSorter: 'alpha', // Sort operations alphabetically
    },
    customSiteTitle: 'Skill Swap Campus API Docs',
    customfavIcon: 'https://skillswap.com/favicon.ico',
    customCss: '.swagger-ui .topbar { display: none }', // Hide Swagger top bar
  });
}