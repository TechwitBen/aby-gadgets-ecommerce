import { useState } from "react";
import { MessageSquare, Send, Loader2, CheckCircle } from "lucide-react";
import { notificationService } from "@/services/notification.service";

interface AdminMessagePanelProps {
  userId: string;
  orderId?: string;
  orderNumber?: string;
}

export const AdminMessagePanel = ({
  userId,
  orderId,
  orderNumber,
}: AdminMessagePanelProps) => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      setError("Both title and message are required.");
      return;
    }
    setError(null);
    setSending(true);
    try {
      await notificationService.sendAdminMessage({
        userId,
        title: title.trim(),
        message: message.trim(),
        orderId,
        orderNumber,
      });
      setSent(true);
      setTitle("");
      setMessage("");
      setTimeout(() => setSent(false), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="pt-2">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare className="w-4 h-4 text-purple-500" />
        <h3 className="text-sm font-bold text-gray-900">Message Customer</h3>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
          Admin
        </span>
      </div>

      <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-4 space-y-3">
        <p className="text-xs text-purple-700">
          Send a notification directly to this customer — visible in their
          Notifications page. Use this to explain delays, pickup instructions,
          or any other update.
        </p>

        {error && (
          <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        {sent && (
          <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            Message sent to customer successfully!
          </div>
        )}

        <input
          type="text"
          placeholder="Title (e.g. 'Update on your order')"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={80}
          className="w-full h-10 text-sm border border-purple-200 bg-white rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-purple-300 placeholder:text-gray-300"
        />

        <textarea
          rows={3}
          placeholder="Message to customer (e.g. 'Your order is delayed due to high demand. We expect it to arrive by Friday…')"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={500}
          className="w-full text-sm border border-purple-200 bg-white rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-purple-300 placeholder:text-gray-300"
        />

        <div className="flex items-center justify-between">
          <span className="text-[10px] text-gray-400">
            {message.length}/500
          </span>
          <button
            onClick={handleSend}
            disabled={sending || !title.trim() || !message.trim()}
            className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl bg-[#6426E1] text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending…
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" /> Send Message
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
};
