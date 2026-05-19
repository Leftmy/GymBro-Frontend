import type { Comment, Post, PostCreatePayload } from "@/app/shared/types/api";
import { request } from "@/app/shared/services/apiClient";
import { mockComments, mockPosts, mockUser } from "@/app/shared/mocks/mockData";

export interface PostsPage { items: Post[]; total: number; }
export interface CommentsPage { items: Comment[]; nextCursor: string | null; }

let posts: Post[] = structuredClone(mockPosts);
let comments: Comment[] = structuredClone(mockComments);
let nextCommentId = 1000;

export const blogService = {
  async getPosts({ limit = 10, offset = 0 }: { limit?: number; offset?: number } = {}): Promise<PostsPage> {
    return request<PostsPage>("/blog/posts/", {
      query: { limit, offset },
      mock: () => ({ items: structuredClone(posts.slice(offset, offset + limit)), total: posts.length }),
    });
  },

  async getPostById(id: string): Promise<Post> {
    return request<Post>(`/blog/posts/${id}/`, {
      mock: () => {
        const p = posts.find((x) => x.id === id);
        if (!p) throw new Error("Post not found");
        return structuredClone(p);
      },
    });
  },

  async getComments(postId: string, {cursor, limit = 5,}: {cursor?: string; limit?: number;} = {}): Promise<CommentsPage> {
    const response = await request<{
      next: string | null;
      previous: string | null;
      results: Comment[];
    }>(
      `/blog/posts/${postId}/comments/`,
      {
        query: {
          cursor,
          limit,
        },

        mock: () => {
          const all = comments
            .filter((c) => c.post === postId)
            .sort((a, b) => b.id - a.id);

          const startIndex =
            cursor != null
              ? all.findIndex((c) => String(c.id) === cursor) + 1
              : 0;

          const slice = all.slice(startIndex, startIndex + limit);

          const nextCursor =
            startIndex + limit < all.length
              ? String(slice[slice.length - 1]?.id)
              : null;

          return {
            next: nextCursor,
            previous: null,
            results: structuredClone(slice),
          };
        },
      }
    );

    const nextCursor =
      response.next
        ? (
            response.next.startsWith("http")
              ? new URL(response.next).searchParams.get("cursor")
              : response.next
          )
        : null;

    return { items: response.results, nextCursor,};
  },
  
  async createComment(payload: { post: string; body: string }): Promise<Comment> {
    return request<Comment>("/blog/comments/", {
      method: "POST",
      body: payload,
      mock: () => {
        const created: Comment = {
          id: nextCommentId++,
          post: payload.post,
          body: payload.body,
          created_at: new Date().toISOString(),
          username: mockUser.username,
        };
        comments = [...comments, created];
        posts = posts.map((p) => (p.id === payload.post ? { ...p, comments_count: p.comments_count + 1 } : p));
        return structuredClone(created);
      },
    });
  },

  async createPost(payload: PostCreatePayload): Promise<Post> {
    return request<Post>("/blog/posts/", {
      method: "POST",
      body: payload,
      mock: () => {
        const created: Post = {
          id: crypto.randomUUID(),
          title: payload.title,
          body: payload.body,
          author: mockUser.username,
          status: payload.status ?? "draft",
          labels: payload.labels ?? null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          published_at: payload.status === "published" ? new Date().toISOString() : null,
          comments_count: 0,
        };
        posts = [created, ...posts];
        return structuredClone(created);
      },
    });
  },

  async deleteComment(commentId: number): Promise<void> {
    return request<void>(`/blog/comments/${commentId}/`, {
      method: "DELETE",
      mock: () => {
        const c = comments.find((x) => x.id === commentId);
        comments = comments.filter((x) => x.id !== commentId);
        if (c) posts = posts.map((p) => (p.id === c.post ? { ...p, comments_count: Math.max(0, p.comments_count - 1) } : p));
        return undefined as unknown as void;
      },
    });
  },
};
