import { Hash, Lock, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ChatChannel } from "@/types/database";

interface ChannelListProps {
  channels: ChatChannel[];
  currentChannelId: string | null;
  onSelectChannel: (channelId: string) => void;
  onCreateChannel?: () => void;
  isAdmin: boolean;
  unreadCounts: Record<string, number>;
}

export function ChannelList({
  channels,
  currentChannelId,
  onSelectChannel,
  onCreateChannel,
  isAdmin,
  unreadCounts,
}: ChannelListProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Canales</h2>
        {isAdmin && onCreateChannel && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onCreateChannel}
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-0.5">
          {channels.map((channel) => {
            const isActive = channel.id === currentChannelId;
            const unread = unreadCounts[channel.id] || 0;

            return (
              <button
                key={channel.id}
                onClick={() => onSelectChannel(channel.id)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                {channel.is_private ? (
                  <Lock className="h-4 w-4 flex-shrink-0" />
                ) : (
                  <Hash className="h-4 w-4 flex-shrink-0" />
                )}
                <span
                  className={cn(
                    "flex-1 truncate text-sm",
                    unread > 0 && "font-semibold"
                  )}
                >
                  {channel.name}
                </span>
                {unread > 0 && (
                  <span className="flex-shrink-0 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
