"use server"

import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"

const prisma = new PrismaClient()

export async function updateTheaterProfile(formData: FormData) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return { success: false, error: "Non authentifié" }
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { theaterProfile: true },
    })

    if (!user) {
      return { success: false, error: "Utilisateur non trouvé" }
    }

    const data = {
      theaterName: formData.get("theaterName") as string,
      description: formData.get("description") as string,
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      postalCode: formData.get("postalCode") as string,
      capacity: Number.parseInt(formData.get("capacity") as string) || null,
      theaterType: formData.get("theaterType") as string,
      website: formData.get("website") as string,
    }

    if (user.theaterProfile) {
      await prisma.theaterProfile.update({
        where: { userId: user.id },
        data,
      })
    } else {
      await prisma.theaterProfile.create({
        data: {
          ...data,
          userId: user.id,
        },
      })
    }

    revalidatePath("/dashboard-theatre/profile")
    return { success: true, message: "Profil mis à jour avec succès" }
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error)
    return { success: false, error: "Erreur lors de la mise à jour" }
  }
}

export async function updateSocialLinks(formData: FormData) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return { success: false, error: "Non authentifié" }
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { theaterProfile: true },
    })

    if (!user?.theaterProfile) {
      return { success: false, error: "Profil théâtre non trouvé" }
    }

    const socialLinks = {
      facebook: (formData.get("facebook") as string) || null,
      instagram: (formData.get("instagram") as string) || null,
      youtube: (formData.get("youtube") as string) || null,
      tiktok: (formData.get("tiktok") as string) || null,
      website: (formData.get("website") as string) || null,
    }

    await prisma.theaterProfile.update({
      where: { userId: user.id },
      data: { socialLinks },
    })

    revalidatePath("/dashboard-theatre/contact")
    return { success: true, message: "Liens sociaux mis à jour avec succès" }
  } catch (error) {
    console.error("Erreur lors de la mise à jour des liens sociaux:", error)
    return { success: false, error: "Erreur lors de la mise à jour" }
  }
}

export async function getTheaterProfile() {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return null
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { theaterProfile: true },
    })

    return user?.theaterProfile || null
  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error)
    return null
  }
}
