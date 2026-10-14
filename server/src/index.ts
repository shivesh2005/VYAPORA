import app from './app';
import { connectDB, disconnectDB } from './config/db';
import { config } from './config/env';
import { Product } from './models/Product';
import { runSeed } from './seed/seed';

const startServer = async () => {
  try {
    await connectDB();

    // Check if database needs auto-seeding
    const count = await Product.countDocuments();
    if (count === 0) {
      console.log('⚡ Detected fresh/empty database. Automatically populating Vyapora catalog with seed data...');
      await runSeed();
    } else {
      console.log(`📦 Database verified with ${count} active products in catalog.`);
    }

    const server = app.listen(config.port, () => {
      console.log(`🚀 VYAPORA — Multi-Vendor E-Commerce Server running on port ${config.port}`);
      console.log(`🌐 Local URL: http://localhost:${config.port}`);
      console.log(`🤖 AI Shopping Assistant Provider: ${config.aiProvider} (Key configured: ${config.geminiApiKey ? 'Yes' : 'No - Grounded Catalog Demo Engine'})`);
      console.log(`🛡️ Environment: ${config.nodeEnv}`);
    });

    const shutdown = async () => {
      console.log('\n🛑 Gracefully shutting down Vyapora server...');
      server.close(async () => {
        await disconnectDB();
        console.log('✅ Server & DB connections safely closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
