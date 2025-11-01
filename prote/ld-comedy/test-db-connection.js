const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

async function testConnection() {
  try {
    console.log('🔍 Test de connexion à Neon PostgreSQL...')
    console.log('DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50) + '...')

    // Test connexion
    await prisma.$connect()
    console.log('✅ Connexion réussie!')

    // Test requête
    const userCount = await prisma.user.count()
    console.log(`✅ Requête réussie - ${userCount} utilisateurs dans la base`)

    // Vérifier les tables
    const tables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `
    console.log('✅ Tables trouvées:', tables.length)
    console.log(tables)

    await prisma.$disconnect()
    console.log('✅ Déconnexion réussie')
    process.exit(0)
  } catch (error) {
    console.error('❌ Erreur:', error.message)
    console.error('❌ Stack:', error.stack)
    await prisma.$disconnect()
    process.exit(1)
  }
}

testConnection()
