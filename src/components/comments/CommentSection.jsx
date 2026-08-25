import { useState, useEffect, useRef, useCallback } from "react";
import client from "../../lib/appwrite";
import { commentService } from "../../services/commentService";
import { useAuth } from "../../hooks/useAuth";
import { DATABASE_CONFIG } from "../../utils/constants";
import { relativeTime } from "../../utils/helpers";
import Avatar from "../common/Avatar";

const { databaseId, commentsCollectionId } = DATABASE_CONFIG;

function CommentSection({ courseId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState("");
  const [live, setLive] = useState(false);
  const scrollRef = useRef(null);

  const appendComment = useCallback((comment) => {
    setComments((prev) =>
      prev.some((c) => c.$id === comment.$id) ? prev : [...prev, comment],
    );
  }, []);

  useEffect(() => {
    if (!courseId) return undefined;
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const data = await commentService.listComments(courseId);
        if (!cancelled) setComments(data);
      } catch {
        // ignore – chat just starts empty
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    // Live updates via Appwrite Realtime
    let unsubscribe;
    try {
      unsubscribe = client.subscribe(
        `databases.${databaseId}.collections.${commentsCollectionId}.documents`,
        (event) => {
          const payload = event.payload;
          if (payload.courseId !== courseId) return;
          if (event.events.some((e) => e.endsWith(".create"))) {
            appendComment(payload);
          }
          if (event.events.some((e) => e.endsWith(".delete"))) {
            setComments((prev) => prev.filter((c) => c.$id !== payload.$id));
          }
        },
      );
      setLive(true);
    } catch {
      setLive(false);
    }

    return () => {
      cancelled = true;
      if (unsubscribe) unsubscribe();
    };
  }, [courseId, appendComment]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [comments.length]);

  const handleSend = async (e) => {
    e?.preventDefault();
    const content = text.trim();
    if (!content || sending) return;
    setSending(true);
    try {
      const comment = await commentService.addComment(courseId, user, content);
      appendComment(comment);
      setText("");
    } catch (err) {
      alert(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (comment) => {
    try {
      await commentService.deleteComment(comment.$id);
      setComments((prev) => prev.filter((c) => c.$id !== comment.$id));
    } catch {
      // ignore
    }
  };

  return (
    <section className="card !p-0 overflow-hidden flex flex-col animate-fade-in-up">
      <header className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
        <h3 className="font-display font-semibold text-white flex items-center gap-2">
          💬 Course Chat
        </h3>
        <span className="badge bg-emerald-400/10 text-emerald-300 border-emerald-400/25">
          <span
            className={`h-1.5 w-1.5 rounded-full bg-emerald-400 ${live ? "animate-pulse" : ""}`}
          />
          {live ? "Live" : "Offline"}
        </span>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4 max-h-[26rem] min-h-[12rem]"
      >
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-12 rounded-2xl bg-white/5 animate-pulse"
                style={{ animationDelay: `${i * 120}ms` }}
              />
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-10 text-surface-500 text-sm">
            <div className="text-3xl mb-2">💬</div>
            No messages yet. Say hi to your team!
          </div>
        ) : (
          comments.map((comment) => {
            const isOwn = comment.userId === user?.$id;
            return (
              <div
                key={comment.$id}
                className={`flex gap-2.5 ${isOwn ? "flex-row-reverse" : ""} group`}
              >
                <Avatar name={comment.userName} size="sm" />
                <div
                  className={`max-w-[75%] ${isOwn ? "text-right" : "text-left"}`}
                >
                  <div
                    className={`flex items-center gap-2 text-[11px] text-surface-500 mb-1 ${isOwn ? "justify-end" : ""}`}
                  >
                    <span className="font-medium text-surface-400">
                      {isOwn ? "You" : comment.userName}
                    </span>
                    <span>{relativeTime(comment.createdAt)}</span>
                    {isOwn && (
                      <button
                        onClick={() => handleDelete(comment)}
                        className="opacity-0 group-hover:opacity-100 text-surface-500 hover:text-rose-300 transition-all"
                        title="Delete message"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  <div
                    className={`inline-block px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap break-words ${
                      isOwn
                        ? "bg-gradient-to-br from-primary-600 to-accent-600 text-white rounded-tr-md shadow-glow"
                        : "bg-white/5 border border-white/10 text-surface-200 rounded-tl-md"
                    }`}
                  >
                    {comment.content}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form
        onSubmit={handleSend}
        className="px-4 py-3 border-t border-white/10 flex items-center gap-2"
      >
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="input !rounded-full flex-1"
          maxLength={2000}
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="btn-primary !rounded-full !px-4 h-10 disabled:opacity-50"
          title="Send message"
        >
          {sending ? "…" : "➤"}
        </button>
      </form>
    </section>
  );
}

export default CommentSection;
