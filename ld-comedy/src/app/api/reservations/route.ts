import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { error: 'Vous devez être connecté pour réserver' },
        { status: 401 }
      )
    }

    const { showId, seats = 1 } = await req.json()

    if (!showId) {
      return NextResponse.json(
        { error: 'ID du spectacle requis' },
        { status: 400 }
      )
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Récupérer le spectacle pour obtenir le prix
    const show = await prisma.show.findUnique({
      where: { id: showId }
    })

    if (!show) {
      return NextResponse.json(
        { error: 'Spectacle non trouvé' },
        { status: 404 }
      )
    }

    // Calculer le prix total
    const totalPrice = show.price * seats

    // Créer la réservation
    const reservation = await prisma.reservation.create({
      data: {
        userId: user.id,
        showId,
        seats,
        totalPrice,
        status: 'confirmed'
      }
    })

    return NextResponse.json(
      { message: 'Réservation créée avec succès', reservation },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erreur lors de la création de la réservation:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la réservation' },
      { status: 500 }
    )
  }
} 