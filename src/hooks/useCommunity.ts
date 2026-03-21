// src/hooks/useCommunity.ts
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Post {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  category: string;
  likes_count: number;
  views_count: number;
  is_pinned: boolean;
  created_at: string;
  author_name?: string;
  author_avatar?: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  likes_count: number;
  created_at: string;
  author_name?: string;
}

export interface Review {
  id: string;
  user_id: string;
  course_id: string;
  rating: number;
  content: string | null;
  created_at: string;
  author_name?: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

// ── usePosts ──────────────────────────────────────────────────
export const usePosts = (search = "") => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("posts")
      .select(`id, user_id, title, content, category, likes_count, views_count, is_pinned, created_at`)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(50);

    if (search) {
      query = query.ilike("title", `%${search}%`);
    }

    const { data } = await query;

    if (data) {
      // ดึง author name จาก profiles
      const userIds = [...new Set(data.map((p) => p.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", userIds);

      const profileMap = Object.fromEntries(
        (profiles ?? []).map((p) => [p.user_id, p])
      );

      setPosts(
        data.map((p) => ({
          ...p,
          author_name: profileMap[p.user_id]?.full_name ?? "ผู้ใช้",
          author_avatar: profileMap[p.user_id]?.avatar_url ?? null,
        }))
      );
    }
    setLoading(false);
  }, [search]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel("posts-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "posts" },
        () => fetchPosts()
      )
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "posts" },
        (payload) => {
          setPosts((prev) =>
            prev.map((p) => p.id === payload.new.id ? { ...p, ...payload.new } : p)
          );
        }
      )
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "posts" },
        (payload) => setPosts((prev) => prev.filter((p) => p.id !== payload.old.id))
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchPosts]);

  // ── Like/Unlike post ────────────────────────────────────────
  const toggleLike = useCallback(async (postId: string, liked: boolean) => {
    if (!user) return;
    if (liked) {
      await supabase.from("post_likes").delete()
        .eq("post_id", postId).eq("user_id", user.id);
    } else {
      await supabase.from("post_likes").insert({ post_id: postId, user_id: user.id });
    }
  }, [user]);

  // ── Create post ─────────────────────────────────────────────
  const createPost = useCallback(async (
    title: string, content: string, category: string
  ): Promise<{ ok: boolean; error?: string }> => {
    if (!user) return { ok: false, error: "กรุณาเข้าสู่ระบบ" };
    const { error } = await supabase.from("posts").insert({
      user_id: user.id, title, content, category,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }, [user]);

  return { posts, loading, toggleLike, createPost, refetch: fetchPosts };
};

// ── usePostLikes ─────────────────────────────────────────────
export const usePostLikes = (postIds: string[]) => {
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !postIds.length) return;
    supabase
      .from("post_likes")
      .select("post_id")
      .eq("user_id", user.id)
      .in("post_id", postIds)
      .then(({ data }) => {
        if (data) setLikedIds(new Set(data.map((l) => l.post_id)));
      });
  }, [user, postIds.join(",")]);

  return likedIds;
};

// ── useComments ──────────────────────────────────────────────
export const useComments = (postId: string | null) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchComments = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    const { data } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (data) {
      const userIds = [...new Set(data.map((c) => c.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);

      const profileMap = Object.fromEntries(
        (profiles ?? []).map((p) => [p.user_id, p])
      );

      setComments(
        data.map((c) => ({
          ...c,
          author_name: profileMap[c.user_id]?.full_name ?? "ผู้ใช้",
        }))
      );
    }
    setLoading(false);
  }, [postId]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  // Realtime comments
  useEffect(() => {
    if (!postId) return;
    const channel = supabase
      .channel(`comments-${postId}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "comments",
        filter: `post_id=eq.${postId}`,
      }, () => fetchComments())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [postId, fetchComments]);

  const addComment = useCallback(async (content: string): Promise<{ ok: boolean; error?: string }> => {
    if (!user || !postId) return { ok: false, error: "กรุณาเข้าสู่ระบบ" };
    const { error } = await supabase.from("comments").insert({
      post_id: postId, user_id: user.id, content,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }, [user, postId]);

  return { comments, loading, addComment, refetch: fetchComments };
};

// ── useReviews ───────────────────────────────────────────────
export const useReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("course_reviews")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (data) {
        const userIds = [...new Set(data.map((r) => r.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", userIds);

        const profileMap = Object.fromEntries(
          (profiles ?? []).map((p) => [p.user_id, p])
        );

        setReviews(
          data.map((r) => ({
            ...r,
            author_name: profileMap[r.user_id]?.full_name ?? "ผู้ใช้",
          }))
        );
      }
      setLoading(false);
    };
    fetch();
  }, []);

  return { reviews, loading };
};

// ── useMessages ──────────────────────────────────────────────
export const useMessages = (receiverId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !receiverId) return;

    supabase
      .from("messages")
      .select("*")
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`)
      .order("created_at", { ascending: true })
      .limit(50)
      .then(({ data }) => { if (data) setMessages(data); });

    const channel = supabase
      .channel(`messages-${user.id}-${receiverId}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "messages",
      }, (payload) => {
        const msg = payload.new as Message;
        if (
          (msg.sender_id === user.id && msg.receiver_id === receiverId) ||
          (msg.sender_id === receiverId && msg.receiver_id === user.id)
        ) {
          setMessages((prev) => [...prev, msg]);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, receiverId]);

  const sendMessage = useCallback(async (content: string): Promise<{ ok: boolean }> => {
    if (!user || !receiverId) return { ok: false };
    const { error } = await supabase.from("messages").insert({
      sender_id: user.id, receiver_id: receiverId, content,
    });
    return { ok: !error };
  }, [user, receiverId]);

  return { messages, sendMessage };
};
