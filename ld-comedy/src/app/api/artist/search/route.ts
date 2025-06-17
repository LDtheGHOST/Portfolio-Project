import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    const artists = await prisma.artistProfile.findMany({
      where: {
        AND: [
          { isPublic: true },
          {
            OR: [{ stageName: { contains: search, mode: "insensitive" } }, { specialties: { hasSome: [search] } }],
          },
        ],
      },
      take: limit,
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ artists })
  } catch (error) {
    console.error("Erreur lors de la recherche d'artistes:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
