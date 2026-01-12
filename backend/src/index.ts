import { createApp } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';

/**
 * Start the server
 */
async function start() {
  try {
    const app = await createApp();

    const address = await app.listen({
      port: env.PORT,
      host: '0.0.0.0', // Listen on all network interfaces
    });

    logger.info('Servidor iniciado com sucesso', {
      address,
      port: env.PORT,
      environment: env.NODE_ENV,
    });

    console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🏛️  Reporta Viseu - Backend API                          ║
║                                                            ║
║   Servidor a correr em: ${address.padEnd(30)}║
║   Ambiente: ${env.NODE_ENV.padEnd(46)}║
║   Base de dados: Ligada                                    ║
║                                                            ║
║   📚 API Documentation:                                     ║
║   - Health: GET ${address}/api/health${' '.repeat(23)}║
║   - Categories: GET ${address}/api/categories${' '.repeat(17)}║
║   - Reports: POST ${address}/api/reports${' '.repeat(19)}║
║   - Upload: POST ${address}/api/upload${' '.repeat(21)}║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    `);
  } catch (error) {
    logger.error('Falha ao iniciar servidor', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM recebido, a encerrar graciosamente...');
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT recebido, a encerrar graciosamente...');
  process.exit(0);
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error('Exceção não capturada', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Rejeição não tratada', { reason, promise });
  process.exit(1);
});

// Start the server
start();
