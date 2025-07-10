import { NextResponse } from "next/server";

// GET: Test simple pour vérifier que les APIs fonctionnent
export async function GET() {
  try {
    const testData = {
      posters: [
        {
          id: "1",
          title: "Spectacle Test 1",
          description: "Description du spectacle test",
          imageUrl: "/chong.png",
          date: new Date().toISOString(),
          venue: "Théâtre Test",
          price: 25,
          likes: 42,
          comments: 12,
          theater: {
            id: "theater1",
            name: "Théâtre des Tests",
            image: "/logo_ld.png"
          },
          artist: {
            id: "artist1",
            name: "Artiste Test",
            stageName: "Test Artist",
            image: "/scandere.png"
          }
        }
      ],
      theaters: [
        {
          id: "theater1",
          name: "Théâtre des Tests",
          description: "Un théâtre de test",
          location: "Paris",
          capacity: 150,
          image: "/logo_ld.png",
          postersCount: 5,
          totalLikes: 230
        }
      ],
      artists: [
        {
          id: "artist1",
          name: "Artiste Test",
          stageName: "Test Artist",
          bio: "Un artiste de test",
          specialties: ["Stand-up"],
          image: "/scandere.png",
          postersCount: 3,
          totalLikes: 120,
          successScore: 150
        }
      ]
    };

    return NextResponse.json(testData);

  } catch (error) {
    console.error("Erreur test:", error);
    return NextResponse.json({ 
      error: "Erreur test", 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
