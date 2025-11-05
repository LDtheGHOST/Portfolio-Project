import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// Endpoint ultra-simple pour tester la connexion DB sur Vercel
export async function GET() {
  const logs: string[] = []

  try {
    logs.push("1. ✅ Route API appelée")

    // Test 1 : Variables d'env
    logs.push(`2. DATABASE_URL existe: ${!!process.env.DATABASE_URL}`)
    logs.push(`3. DATABASE_URL commence par: ${process.env.DATABASE_URL?.substring(0, 20)}...`)

    // Test 2 : Prisma initialisé
    logs.push(`4. Prisma existe: ${!!prisma}`)

    // Test 3 : Connexion
    logs.push("5. Tentative de connexion à MongoDB...")
    const startConnect = Date.now()

    try {
      await prisma.$connect()
      const connectTime = Date.now() - startConnect
      logs.push(`6. ✅ Connexion réussie en ${connectTime}ms`)
    } catch (connectError) {
      logs.push(`6. ❌ Erreur connexion: ${connectError instanceof Error ? connectError.message : 'Unknown'}`)
      throw connectError
    }

    // Test 4 : Requête simple
    logs.push("7. Tentative de requête (count users)...")
    const startQuery = Date.now()

    try {
      const userCount = await prisma.user.count()
      const queryTime = Date.now() - startQuery
      logs.push(`8. ✅ Requête réussie en ${queryTime}ms - ${userCount} utilisateurs`)
    } catch (queryError) {
      logs.push(`8. ❌ Erreur requête: ${queryError instanceof Error ? queryError.message : 'Unknown'}`)
      throw queryError
    }

    logs.push("9. ✅ TOUS LES TESTS RÉUSSIS !")

    return NextResponse.json({
      success: true,
      message: "Base de données fonctionne parfaitement !",
      logs,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("❌ Test DB échoué:", error)

    return NextResponse.json({
      success: false,
      message: "Échec de connexion à la base de données",
      error: error instanceof Error ? {
        message: error.message,
        name: error.name,
        stack: error.stack?.split('\n').slice(0, 3)
      } : 'Unknown error',
      logs,
      timestamp: new Date().toISOString(),
      hints: [
        "Si vous voyez 'Server selection timeout': MongoDB bloque les connexions depuis Vercel",
        "Si DATABASE_URL n'existe pas: Variables d'environnement mal configurées",
        "Si 'PrismaClient': Problème d'initialisation Prisma"
      ]
    }, { status: 500 })
  }
}
