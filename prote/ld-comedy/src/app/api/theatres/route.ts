import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function GET() {
  try {
    const theatres = await prisma.user.findMany({
      where: {
        role: Role.THEATRE,
        theaterProfile: {
          isNot: null,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true,
        description: true,
        address: true,
        city: true,
        phoneNumber: true,
        theaterProfile: {
          select: {
            id: true,
            capacity: true,
            theaterName: true,
            stageType: true,
            facilities: true,
            programmingTypes: true,
            coverImage: true,
            isVerified: true,
            totalEvents: true,
            totalArtists: true,
            averageRating: true,
          },
        },
      },
    });

    return NextResponse.json(theatres);
  } catch (error) {
    console.error("Error fetching theatres:", error);
    return NextResponse.json(
      { error: "Error fetching theatres" },
      { status: 500 }
    );
  }
}
