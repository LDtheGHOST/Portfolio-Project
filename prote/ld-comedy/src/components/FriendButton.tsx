"use client"

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface FriendButtonProps {
  artistId?: string;
  theaterId?: string;
  isOwner: boolean;
}

export default function FriendButton({ artistId, theaterId, isOwner }: FriendButtonProps) {
  const { data: session } = useSession();
  const [isFriend, setIsFriend] = useState(false);
  const [friendLoading, setFriendLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id || isOwner) {
      setLoading(false);
      return;
    }

    // Vérifier le statut d'amitié
    const checkFriendship = async () => {
      try {
        let url = "";
        if (session.user.role === "THEATER" && artistId) {
          url = `/api/favorite/check?artistId=${artistId}`;
        } else if (session.user.role === "ARTIST" && theaterId) {
          url = `/api/favorite/check?theaterId=${theaterId}`;
        }

        if (url) {
          const res = await fetch(url);
          const data = await res.json();
          setIsFriend(!!data.isFavorite);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification d'amitié:", error);
        setIsFriend(false);
      } finally {
        setLoading(false);
      }
    };

    checkFriendship();
  }, [artistId, theaterId, session, isOwner]);

  const handleToggleFriend = async () => {
    if (!session?.user?.id || friendLoading) return;
    
    setFriendLoading(true);
    try {
      let body: any = {};
      if (session.user.role === "THEATER" && artistId) {
        body = { artistId };
      } else if (session.user.role === "ARTIST" && theaterId) {
        body = { theaterId };
      } else {
        setFriendLoading(false);
        return;
      }

      const method = isFriend ? "DELETE" : "POST";
      const res = await fetch("/api/favorite", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setIsFriend(!isFriend);
        const data = await res.json();
        console.log(data.message);
      } else {
        const error = await res.json();
        console.error("Erreur:", error.error);
        alert(error.error || "Erreur lors de l'opération");
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout/suppression d'ami:", error);
      alert("Erreur lors de l'opération");
    } finally {
      setFriendLoading(false);
    }
  };

  // Ne pas afficher le bouton si l'utilisateur n'est pas connecté, si c'est le propriétaire, ou si le chargement n'est pas terminé
  if (!session?.user?.id || isOwner || loading) return null;

  // Ne pas afficher si ce n'est pas une combinaison valide (théâtre regardant un artiste ou artiste regardant un théâtre)
  if (
    !(session.user.role === "THEATER" && artistId) &&
    !(session.user.role === "ARTIST" && theaterId)
  ) {
    return null;
  }

  return (
    <button
      className={`absolute top-4 left-4 bg-amber-400 text-black font-bold px-4 py-2 rounded-lg shadow-lg hover:bg-amber-500 transition-colors z-20 flex items-center gap-2 ${
        friendLoading ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      onClick={handleToggleFriend}
      disabled={friendLoading}
    >
      {friendLoading ? (
        <>
          <div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full"></div>
          {isFriend ? "Suppression..." : "Ajout..."}
        </>
      ) : (
        <>
          {isFriend ? (
            <>
              <span>❌</span>
              Retirer des amis
            </>
          ) : (
            <>
              <span>➕</span>
              Ajouter en ami
            </>
          )}
        </>
      )}
    </button>
  );
}
