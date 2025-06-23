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

  useEffect(() => {
    if (!session) return;
    if (session.user.role === "THEATER" && artistId) {
      fetch(`/api/favorite/check?artistId=${artistId}`)
        .then(res => res.json())
        .then(data => setIsFriend(!!data.isFavorite))
        .catch(() => setIsFriend(false));
    } else if (session.user.role === "ARTIST" && theaterId) {
      fetch(`/api/favorite/check?theaterId=${theaterId}`)
        .then(res => res.json())
        .then(data => setIsFriend(!!data.isFavorite))
        .catch(() => setIsFriend(false));
    }
  }, [artistId, theaterId, session]);

  const handleToggleFriend = async () => {
    if (!session) return;
    setFriendLoading(true);
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
    if (res.ok) setIsFriend(!isFriend);
    setFriendLoading(false);
  };

  if (!session || isOwner) return null;
  if (
    (session.user.role === "THEATER" && artistId) ||
    (session.user.role === "ARTIST" && theaterId)
  ) {
    return (
      <button
        className={`absolute top-4 left-4 bg-amber-400 text-black font-bold px-4 py-2 rounded-lg shadow-lg hover:bg-amber-500 transition-colors z-20 ${friendLoading ? 'opacity-50' : ''}`}
        onClick={handleToggleFriend}
        disabled={friendLoading}
      >
        {isFriend ? "Retirer des amis" : "Ajouter en ami"}
      </button>
    );
  }
  return null;
}
