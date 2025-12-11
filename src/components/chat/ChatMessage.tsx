import { useState } from "react";
import { MessageSquare, Smile } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn, getInitials, parseRichText, formatDateTime } from "@/lib/utils";
import type { ChatMessage as ChatMessageType, Profile } from "@/types/database";

const EMOJI_OPTIONS = ["👍", "❤️", "😄", "🎉", "🤔", "👀"];

interface ChatMessageProps {
  message: ChatMessageType;
  user?: Profile;
  currentUserId: string;
  onReact: (emoji: string) => void;
  onReply: () => void;
  reactions: { emoji: string; count: number; hasReacted: boolean }[];
}

export function ChatMessage({
  message,
  user,
  currentUserId,
  onReact,
  onReply,
  reactions,
}: ChatMessageProps) {
  const [showActions, setShowActions] = useState(false);
  const isOwn = message.user_id === currentUserId;

  return (
    <div
      className="group relative flex gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <Avatar className="h-9 w-9 flex-shrink-0">
        <AvatarImage src={user?.avatar_url || undefined} />
        <AvatarFallback>
          {user ? getInitials(user.full_name) : "?"}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className={cn("font-medium text-sm", isOwn && "text-primary")}>
            {user?.full_name || "Usuario"}
          </span>
          <span className="text-xs text-gray-400">
            {formatDateTime(message.created_at)}
          </span>
        </div>

        <div
          className="text-sm text-gray-700 mt-0.5 break-words"
          dangerouslySetInnerHTML={{ __html: parseRichText(message.content) }}
        />

        {/* Reactions */}
        {reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {reactions.map((reaction) => (
              <button
                key={reaction.emoji}
                onClick={() => onReact(reaction.emoji)}
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-colors",
                  reaction.hasReacted
                    ? "bg-primary-50 border-primary-200 text-primary"
                    : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                )}
              >
                <span>{reaction.emoji}</span>
                <span>{reaction.count}</span>
              </button>
            ))}
          </div>
        )}

        {/* Reply count */}
        {message.reply_count && message.reply_count > 0 && (
          <button
            onClick={onReply}
            className="flex items-center gap-1 mt-2 text-xs text-primary hover:underline"
          >
            <MessageSquare className="h-3 w-3" />
            <span>
              {message.reply_count}{" "}
              {message.reply_count === 1 ? "respuesta" : "respuestas"}
            </span>
          </button>
        )}
      </div>

      {/* Actions */}
      {showActions && (
        <div className="absolute right-2 top-2 flex items-center gap-1 bg-white border border-gray-100 rounded-lg shadow-sm p-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Smile className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2" align="end">
              <div className="flex gap-1">
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => onReact(emoji)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors text-lg"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onReply}>
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
