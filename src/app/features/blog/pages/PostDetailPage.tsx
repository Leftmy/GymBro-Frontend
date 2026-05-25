import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { blogService } from "@/app/services";
import type { Comment, Post } from "@/app/shared/types/api";
import { SkeletonList } from "@/app/shared/components/common/SkeletonList";
import { useAuth } from "@/app/features/auth/context/AuthContext";

export function PostDetailPage() {
  const { t } = useTranslation();
  const { id = "" } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    blogService
      .getPostById(id)
      .then((p) => setPost(p ?? null))
      .catch(() => setPost(null));
  }, [id]);

  useEffect(() => {
    if (!post) return;
    setEditTitle(post.title);
    setEditBody(post.body);
  }, [post?.id]);

  const loadMore = async () => {
    setLoadingMore(true);
    const r = await blogService.getComments(id, { cursor: cursor ?? undefined, limit: 3 });
    setComments((c) => [...c, ...r.items]);
    setCursor(r.nextCursor);
    setHasMore(r.nextCursor !== null);
    setLoadingMore(false);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (post) loadMore(); }, [post?.id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    setPosting(true);
    const created = await blogService.createComment({ post: id, body });
    setComments((c) => [...c, created]);
    setBody("");
    setPosting(false);
  };

  const handleSave = async () => {
    if (!post) return;
    setSaving(true);
    try {
      const updated = await blogService.updatePost(post.id, { title: editTitle, body: editBody });
      setPost(updated);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!post) return;
    if (!confirm("Delete post?")) return;
    await blogService.deletePost(post.id);
    navigate("/blog");
  };

  if (!post) return <SkeletonList count={1} />;

  // Normalize author/status checks to handle different API shapes (string or object)
  const isAuthor = Boolean(
    user && (
      post.author === user.username ||
      (typeof (post.author as any) === "object" && (post.author as any).username === user.username) ||
      String(post.author) === String(user.id) ||
      post.author === user.uuid
    )
  );

  const normalizedStatus = String(post.status ?? "").toLowerCase();

  // Debug output to help trace why edit/delete buttons may be hidden
  // eslint-disable-next-line no-console
  console.debug("[PostDetailPage] debug:", { post, user, isAuthor, normalizedStatus });

  return (
    <article className="max-w-2xl mx-auto space-y-6">
      <Link to="/blog" className="text-muted-foreground hover:text-foreground">
        {t("blog.backToBlog")}
      </Link>

      <header className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            {editing ? (
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 rounded border border-border bg-background"
              />
            ) : (
              <h1>{post.title}</h1>
            )}
            <p className="text-muted-foreground">
              {t("blog.by")} {post.author} · {new Date(post.created_at).toLocaleDateString()}
            </p>
          </div>

          <div className="flex gap-2">
            {isAuthor && normalizedStatus === "draft" && !editing && (
              <>
                <button onClick={() => setEditing(true)} className="px-3 py-1.5 rounded border border-border hover:bg-muted text-sm">
                  {t("profile.edit")}
                </button>
                <button onClick={handleDelete} className="px-3 py-1.5 rounded border border-destructive text-destructive text-sm">
                  {t("gym.deleteWorkout")}
                </button>
              </>
            )}

            {editing && (
              <>
                <button onClick={handleSave} disabled={saving} className="px-3 py-1.5 rounded bg-foreground text-background text-sm">
                  {saving ? t("common.loading") : t("profile.save")}
                </button>
                <button onClick={() => setEditing(false)} className="px-3 py-1.5 rounded border border-border text-sm">
                  {t("common.cancel")}
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {editing ? (
        <textarea value={editBody} onChange={(e) => setEditBody(e.target.value)} rows={8} className="w-full px-3 py-2 rounded border border-border bg-background resize-none" />
      ) : (
        <p className="whitespace-pre-line">{post.body}</p>
      )}

      {/* Comments section */}
      <section className="border-t border-border pt-6 space-y-4">
        <h2>{t("blog.commentsTitle", { count: post.comments_count })}</h2>

        {comments.length === 0 && !loadingMore && (
          <p className="text-muted-foreground">{t("blog.noComments")}</p>
        )}

        <ul className="space-y-3">
          {comments.map((c) => (
            <li key={c.id} className="border border-border rounded-xl p-4 bg-card">
              <div className="flex justify-between text-muted-foreground">
                <span>{c.username}</span>
                <span>{new Date(c.created_at).toLocaleDateString()}</span>
              </div>
              <p className="mt-1">{c.body}</p>
            </li>
          ))}
        </ul>

        {hasMore && (
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-3 py-1.5 rounded border border-border hover:bg-muted disabled:opacity-50"
          >
            {loadingMore ? t("blog.loading") : t("blog.loadMore")}
          </button>
        )}

        {/* Comment form (disabled for draft posts) */}
        {normalizedStatus !== "draft" && (
          <form onSubmit={submit} className="space-y-3 pt-2">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              placeholder={t("blog.writeComment")}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background resize-none"
            />
            <button
              type="submit"
              disabled={posting || !body.trim()}
              className="px-4 py-2 rounded-lg bg-foreground text-background disabled:opacity-50"
            >
              {posting ? t("blog.posting") : t("blog.post")}
            </button>
          </form>
        )}
      </section>
    </article>
  );
}
