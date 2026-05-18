import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { PenSquare, X, Tag, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
import { blogService } from "@/app/services";
import type { Post, PostCreatePayload, Status } from "@/app/shared/types/api";
import { SkeletonList } from "@/app/shared/components/common/SkeletonList";

const PAGE_SIZE = 5;

// ── Create Post Modal ─────────────────────────────────────────────────────────
function CreatePostModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [labels, setLabels] = useState("");
  const [status, setStatus] = useState<Status>("draft");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; body?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!title.trim()) e.title = t("blog.titleRequired");
    if (!body.trim()) e.body = t("blog.bodyRequired");
    return e;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      const payload: PostCreatePayload = {
        title: title.trim(),
        body: body.trim(),
        status,
        labels: labels.trim()
          ? labels.split(",").map((l) => l.trim()).filter(Boolean)
          : undefined,
      };
      await blogService.createPost(payload);
      onCreated();
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <PenSquare className="w-4 h-4" />
            <h2>{t("blog.createPostTitle")}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors rounded-lg p-1 hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="p-6 space-y-5">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-sm">{t("blog.postTitle")}</label>
            <input
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setErrors((p) => ({ ...p, title: undefined })); }}
              placeholder={t("blog.postTitlePlaceholder")}
              maxLength={255}
              className={`w-full px-3 py-2.5 rounded-xl border bg-background focus:outline-none focus:ring-2 transition ${
                errors.title ? "border-destructive focus:ring-destructive/20" : "border-border focus:ring-foreground/20"
              }`}
            />
            {errors.title && <p className="text-destructive text-xs">{errors.title}</p>}
            <p className="text-muted-foreground text-xs text-right">{title.length}/255</p>
          </div>

          {/* Body */}
          <div className="space-y-1.5">
            <label className="text-sm">{t("blog.postBody")}</label>
            <textarea
              value={body}
              onChange={(e) => { setBody(e.target.value); setErrors((p) => ({ ...p, body: undefined })); }}
              placeholder={t("blog.postBodyPlaceholder")}
              rows={6}
              className={`w-full px-3 py-2.5 rounded-xl border bg-background focus:outline-none focus:ring-2 transition resize-none ${
                errors.body ? "border-destructive focus:ring-destructive/20" : "border-border focus:ring-foreground/20"
              }`}
            />
            {errors.body && <p className="text-destructive text-xs">{errors.body}</p>}
          </div>

          {/* Labels */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-sm">
              <Tag className="w-3.5 h-3.5 text-muted-foreground" />
              {t("blog.postLabels")}
              <span className="text-muted-foreground text-xs">({t("common.optional")})</span>
            </label>
            <input
              type="text"
              value={labels}
              onChange={(e) => setLabels(e.target.value)}
              placeholder={t("blog.postLabelsPlaceholder")}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-foreground/20 transition"
            />
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label className="text-sm">{t("blog.postStatus")}</label>
            <div className="flex gap-2">
              {(["draft", "published"] as Status[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`px-4 py-2 rounded-lg text-sm transition-all ${
                    status === s
                      ? "bg-foreground text-background"
                      : "border border-border hover:bg-muted"
                  }`}
                >
                  {t(`blog.status${s.charAt(0).toUpperCase() + s.slice(1)}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-border hover:bg-muted transition-colors"
            >
              {t("blog.cancelCreate")}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2.5 rounded-xl bg-foreground text-background hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting ? t("blog.submitting") : t("blog.submit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Blog Page ─────────────────────────────────────────────────────────────────
export function BlogPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<Post[] | null>(null);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [showCreate, setShowCreate] = useState(false);

  const load = () => {
    setItems(null);
    blogService
      .getPosts({ limit: PAGE_SIZE, offset })
      .then((r) => { setItems(r); setTotal(r.total); });
  };

  
  useEffect(() => { load(); }, [offset]); // eslint-disable-line react-hooks/exhaustive-deps

  const lastOffset = Math.max(0, Math.floor((total - 1) / PAGE_SIZE) * PAGE_SIZE);
  const from = Math.min(offset + 1, total);
  const to = Math.min(offset + PAGE_SIZE, total);
  
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1>{t("blog.title")}</h1>
          <p className="text-muted-foreground">{t("blog.subtitle")}</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-foreground text-background hover:opacity-90 transition-opacity shrink-0"
        >
          <PenSquare className="w-4 h-4" />
          {t("blog.createPost")}
        </button>
      </div>

      {!items && <SkeletonList />}

      {items && items.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="text-muted-foreground">{t("blog.noPosts")}</p>
        </div>
      )}
      
      {items && items.length > 0 && (
        <div className="space-y-3">
          {items.map((p) => (
            <Link
              key={p.id}
              to={`/blog/${p.id}`}
              className="group block bg-card border border-border rounded-xl p-5 hover:shadow-md hover:border-foreground/20 transition-all duration-200"
            >
              <div className="flex justify-between items-start gap-3">
                <h3 className="group-hover:text-foreground transition-colors">{p.title}</h3>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-muted-foreground text-sm whitespace-nowrap">
                    {new Date(p.created_at).toLocaleDateString()}
                  </span>
                  {p.status && p.status !== "published" && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full capitalize"
                      style={{
                        backgroundColor: p.status === "draft" ? "var(--accent-orange, #f97316)" : "var(--accent-blue, #3b82f6)",
                        color: "#fff",
                        opacity: 0.85,
                      }}
                    >
                      {p.status}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-muted-foreground line-clamp-2 mt-1 leading-relaxed">{p.body}</p>

              <div className="flex items-center gap-2 mt-3 text-muted-foreground text-sm">
                <span>{t("blog.by")} <span className="">{p.author}</span></span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5" />
                  {p.comments_count} {t("blog.comments")}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > PAGE_SIZE && (
        <div className="flex items-center justify-between gap-2 pt-2">
          <button
            disabled={offset === 0}
            onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border disabled:opacity-40 hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            {t("blog.previous")}
          </button>
          <span className="text-muted-foreground text-sm">
            {t("blog.showing", { from, to, total })}
          </span>
          <button
            disabled={offset >= lastOffset}
            onClick={() => setOffset(offset + PAGE_SIZE)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border disabled:opacity-40 hover:bg-muted transition-colors"
          >
            {t("blog.next")}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {showCreate && (
        <CreatePostModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setOffset(0); load(); }}
        />
      )}
    </div>
  );
}
