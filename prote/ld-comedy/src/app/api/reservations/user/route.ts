import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const reservations = await prisma.reservation.findMany({
      where: {
        user: {
          email: session.user.email
        }
      },
      include: {
        show: true
      }
    })

    return NextResponse.json(reservations)
  } catch (error) {
    console.error('Erreur lors de la récupération des réservations:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des réservations' },
      { status: 500 }
    )
  }
} 