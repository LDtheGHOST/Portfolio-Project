const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    const result = await prisma.$queryRaw`db.version()`;
    console.log('Base de données connectée avec succès:', result);
  } catch (error) {
    console.error('Erreur de connexion à la base de données:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
