import { useState, useEffect, useRef, useCallback } from "react";
import { Hash, Users, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { ChannelList } from "@/components/chat/ChannelList";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { MessageInput } from "@/components/chat/MessageInput";
import { ThreadPanel } from "@/components/chat/ThreadPanel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { ChatChannel, ChatMessage as ChatMessageType, Profile, MessageReaction } from "@/types/database";

export function ChatPage() {
  const { user, profile, isAdmin } = useAuth();
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [currentChannel, setCurrentChannel] = useState<ChatChannel | null>(null);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [users, setUsers] = useState<Record<string, Profile>>({});
  const [reactions, setReactions] = useState<Record<string, MessageReaction[]>>({});
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelPrivate, setNewChannelPrivate] = useState(false);
  const [selectedThread, setSelectedThread] = useState<ChatMessageType | null>(null);
  const [threadReplies, setThreadReplies] = useState<ChatMessageType[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchChannels();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (currentChannel) {
      fetchMessages(currentChannel.id);
      subscribeToChannel(currentChannel.id);
    }
  }, [currentChannel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchChannels = async () => {
    const { data, error } = await supabase
      .from("chat_channels")
      .select("*")
      .order("name");

    if (!error && data) {
      setChannels(data);
      if (data.length > 0 && !currentChannel) {
        setCurrentChannel(data[0]);
      }
    }
    setLoading(false);
  };

  const fetchUsers = async () => {
    const { data } = await supabase.from("profiles").select("*");
    if (data) {
      const usersMap: Record<string, Profile> = {};
      data.forEach((u) => {
        usersMap[u.id] = u;
      });
      setUsers(usersMap);
    }
  };

  const fetchMessages = async (channelId: string) => {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("channel_id", channelId)
      .is("parent_message_id", null)
      .order("created_at", { ascending: true })
      .limit(100);

    if (!error && data) {
      // Count replies
      const messageIds = data.map((m) => m.id);
      const { data: repliesData } = await supabase
        .from("chat_messages")
        .select("parent_message_id")
        .in("parent_message_id", messageIds);

      const replyCounts: Record<string, number> = {};
      repliesData?.forEach((r) => {
        if (r.parent_message_id) {
          replyCounts[r.parent_message_id] = (replyCounts[r.parent_message_id] || 0) + 1;
        }
      });

      const messagesWithReplies = data.map((m) => ({
        ...m,
        reply_count: replyCounts[m.id] || 0,
      }));

      setMessages(messagesWithReplies);
      fetchReactions(messageIds);
    }
  };

  const fetchReactions = async (messageIds: string[]) => {
    if (messageIds.length === 0) return;

    const { data } = await supabase
      .from("message_reactions")
      .select("*")
      .in("message_id", messageIds);

    if (data) {
      const reactionsMap: Record<string, MessageReaction[]> = {};
      data.forEach((r) => {
        if (!reactionsMap[r.message_id]) {
          reactionsMap[r.message_id] = [];
        }
        reactionsMap[r.message_id].push(r);
      });
      setReactions(reactionsMap);
    }
  };

  const subscribeToChannel = (channelId: string) => {
    const subscription = supabase
      .channel(`chat:${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `channel_id=eq.${channelId}`,
        },
        (payload) => {
          const newMessage = payload.new as ChatMessageType;
          if (!newMessage.parent_message_id) {
            setMessages((prev) => [...prev, { ...newMessage, reply_count: 0 }]);
          } else if (selectedThread && newMessage.parent_message_id === selectedThread.id) {
            setThreadReplies((prev) => [...prev, newMessage]);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const handleSendMessage = async (content: string) => {
    if (!user || !currentChannel) return;

    const { error } = await supabase.from("chat_messages").insert({
      channel_id: currentChannel.id,
      user_id: user.id,
      content,
    });

    if (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleReact = async (messageId: string, emoji: string) => {
    if (!user) return;

    const existingReaction = reactions[messageId]?.find(
      (r) => r.user_id === user.id && r.emoji === emoji
    );

    if (existingReaction) {
      await supabase.from("message_reactions").delete().eq("id", existingReaction.id);
      setReactions((prev) => ({
        ...prev,
        [messageId]: prev[messageId]?.filter((r) => r.id !== existingReaction.id) || [],
      }));
    } else {
      const { data, error } = await supabase
        .from("message_reactions")
        .insert({
          message_id: messageId,
          user_id: user.id,
          emoji,
        })
        .select()
        .single();

      if (!error && data) {
        setReactions((prev) => ({
          ...prev,
          [messageId]: [...(prev[messageId] || []), data],
        }));
      }
    }
  };

  const handleOpenThread = async (message: ChatMessageType) => {
    setSelectedThread(message);

    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("parent_message_id", message.id)
      .order("created_at", { ascending: true });

    setThreadReplies(data || []);
  };

  const handleSendReply = async (content: string) => {
    if (!user || !selectedThread) return;

    await supabase.from("chat_messages").insert({
      channel_id: selectedThread.channel_id,
      user_id: user.id,
      content,
      parent_message_id: selectedThread.id,
    });
  };

  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) return;

    const slug = newChannelName
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    const { data, error } = await supabase
      .from("chat_channels")
      .insert({
        name: newChannelName,
        slug,
        is_private: newChannelPrivate,
      })
      .select()
      .single();

    if (!error && data) {
      setChannels((prev) => [...prev, data]);
      setCurrentChannel(data);
      setShowCreateChannel(false);
      setNewChannelName("");
      setNewChannelPrivate(false);
    }
  };

  const getReactionsForMessage = (messageId: string) => {
    const messageReactions = reactions[messageId] || [];
    const emojiCounts: Record<string, { count: number; userIds: string[] }> = {};

    messageReactions.forEach((r) => {
      if (!emojiCounts[r.emoji]) {
        emojiCounts[r.emoji] = { count: 0, userIds: [] };
      }
      emojiCounts[r.emoji].count++;
      emojiCounts[r.emoji].userIds.push(r.user_id);
    });

    return Object.entries(emojiCounts).map(([emoji, data]) => ({
      emoji,
      count: data.count,
      hasReacted: user ? data.userIds.includes(user.id) : false,
    }));
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] bg-white rounded-xl border border-gray-100">
        <div className="w-64 border-r border-gray-100">
          <Skeleton className="h-full" />
        </div>
        <div className="flex-1">
          <Skeleton className="h-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-xl border border-gray-100 overflow-hidden">
      {/* Channels sidebar */}
      <div className="w-64 border-r border-gray-100 flex-shrink-0 hidden md:block">
        <ChannelList
          channels={channels}
          currentChannelId={currentChannel?.id || null}
          onSelectChannel={(id) => {
            const channel = channels.find((c) => c.id === id);
            if (channel) setCurrentChannel(channel);
          }}
          onCreateChannel={isAdmin ? () => setShowCreateChannel(true) : undefined}
          isAdmin={isAdmin}
          unreadCounts={{}}
        />
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Channel header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Hash className="h-5 w-5 text-gray-400" />
            <h2 className="font-semibold text-gray-900">
              {currentChannel?.name || "Selecciona un canal"}
            </h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Users className="h-4 w-4" />
            <span>{Object.keys(users).length} miembros</span>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1">
          <div className="py-4">
            {messages.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Hash className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p>No hay mensajes en este canal</p>
                <p className="text-sm">Sé el primero en escribir</p>
              </div>
            ) : (
              messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  user={users[message.user_id]}
                  currentUserId={user?.id || ""}
                  onReact={(emoji) => handleReact(message.id, emoji)}
                  onReply={() => handleOpenThread(message)}
                  reactions={getReactionsForMessage(message.id)}
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="px-4 py-2 text-sm text-gray-500">
            {typingUsers.join(", ")} {typingUsers.length === 1 ? "está" : "están"} escribiendo...
          </div>
        )}

        {/* Message input */}
        <MessageInput
          onSendMessage={handleSendMessage}
          users={Object.values(users)}
          disabled={!currentChannel}
        />
      </div>

      {/* Thread panel */}
      {selectedThread && (
        <div className="w-80 flex-shrink-0 hidden lg:block">
          <ThreadPanel
            parentMessage={selectedThread}
            replies={threadReplies}
            users={users}
            currentUserId={user?.id || ""}
            onClose={() => setSelectedThread(null)}
            onSendReply={handleSendReply}
            onReact={handleReact}
            reactions={reactions}
          />
        </div>
      )}

      {/* Create channel dialog */}
      <Dialog open={showCreateChannel} onOpenChange={setShowCreateChannel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear canal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="channel-name">Nombre del canal</Label>
              <Input
                id="channel-name"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                placeholder="general"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="channel-private">Canal privado</Label>
              <Switch
                id="channel-private"
                checked={newChannelPrivate}
                onCheckedChange={setNewChannelPrivate}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateChannel(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateChannel}>Crear canal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
