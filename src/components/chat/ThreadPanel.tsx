import { X } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { MessageInput } from "./MessageInput";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import type { ChatMessage as ChatMessageType, Profile } from "@/types/database";

interface ThreadPanelProps {
  parentMessage: ChatMessageType;
  replies: ChatMessageType[];
  users: Record<string, Profile>;
  currentUserId: string;
  onClose: () => void;
  onSendReply: (content: string) => void;
  onReact: (messageId: string, emoji: string) => void;
  reactions: Record<string, { emoji: string; count: number; hasReacted: boolean }[]>;
}

export function ThreadPanel({
  parentMessage,
  replies,
  users,
  currentUserId,
  onClose,
  onSendReply,
  onReact,
  reactions,
}: ThreadPanelProps) {
  return (
    <div className="flex flex-col h-full border-l border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">Hilo</h3>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Parent message */}
      <div className="border-b border-gray-100">
        <ChatMessage
          message={parentMessage}
          user={users[parentMessage.user_id]}
          currentUserId={currentUserId}
          onReact={(emoji) => onReact(parentMessage.id, emoji)}
          onReply={() => {}}
          reactions={reactions[parentMessage.id] || []}
        />
      </div>

      {/* Replies */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          <p className="px-3 py-2 text-xs text-gray-500">
            {replies.length} {replies.length === 1 ? "respuesta" : "respuestas"}
          </p>
          {replies.map((reply) => (
            <ChatMessage
              key={reply.id}
              message={reply}
              user={users[reply.user_id]}
              currentUserId={currentUserId}
              onReact={(emoji) => onReact(reply.id, emoji)}
              onReply={() => {}}
              reactions={reactions[reply.id] || []}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Reply input */}
      <MessageInput
        onSendMessage={onSendReply}
        placeholder="Responder..."
        users={Object.values(users)}
      />
    </div>
  );
}
