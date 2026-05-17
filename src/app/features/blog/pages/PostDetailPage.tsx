import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { blogService } from "@/app/services";
import type { Comment, Post } from "@/app/shared/types/api";
import { SkeletonList } from "@/app/shared/components/common/SkeletonList";

export function PostDetailPage() {
  const { t } = useTranslation();
  const { id = "" } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    blogService
      .getPostById(id)
      .then((p) => setPost(p ?? null))
      .catch(() => setPost(null));
  }, [id]);

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

  if (!post) return <SkeletonList count={1} />;

  return (
    <article className="max-w-2xl mx-auto space-y-6">
      <Link to="/blog" className="text-muted-foreground hover:text-foreground">
        {t("blog.backToBlog")}
      </Link>

      <header className="space-y-2">
        <h1>{post.title}</h1>
        <p className="text-muted-foreground">
          {t("blog.by")} {post.author} · {new Date(post.created_at).toLocaleDateString()}
        </p>
      </header>

      <p className="whitespace-pre-line">{post.body}</p>

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

        {/* Comment form */}
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
      </section>
    </article>
  );
}
