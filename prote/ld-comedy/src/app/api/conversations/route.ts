import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET - Récupérer toutes les conversations de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          has: user.id
        },
        isActive: true
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: {
        lastMessageAt: 'desc'
      }
    })

    // Enrichir les conversations avec les informations des participants
    const enrichedConversations = await Promise.all(
      conversations.map(async (conversation) => {
        const otherParticipantId = conversation.participants.find(
          id => id !== user.id
        )

        if (!otherParticipantId) return conversation

        const otherUser = await prisma.user.findUnique({
          where: { id: otherParticipantId },
          include: {
            artistProfile: true,
            theaterProfile: true
          }
        })

        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conversation.id,
            senderId: { not: user.id },
            isRead: false
          }
        })

        return {
          ...conversation,
          otherUser,
          unreadCount
        }
      })
    )

    return NextResponse.json({ conversations: enrichedConversations })
  } catch (error) {
    console.error('Erreur lors du chargement des conversations:', error)
    return NextResponse.json(
      { error: 'Erreur lors du chargement des conversations' },
      { status: 500 }
    )
  }
}

// POST - Créer une nouvelle conversation ou récupérer une existante
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
    }

    const { participantId } = await request.json()

    if (!participantId) {
      return NextResponse.json(
        { error: 'ID du participant requis' },
        { status: 400 }
      )
    }

    // Vérifier si une conversation existe déjà
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { has: user.id } },
          { participants: { has: participantId } }
        ]
      }
    })

    if (existingConversation) {
      return NextResponse.json({ conversation: existingConversation })
    }

    // Créer une nouvelle conversation
    const newConversation = await prisma.conversation.create({
      data: {
        participants: [user.id, participantId]
      }
    })

    return NextResponse.json({ conversation: newConversation })
  } catch (error) {
    console.error('Erreur lors de la création de la conversation:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la conversation' },
      { status: 500 }
    )
  }
}
