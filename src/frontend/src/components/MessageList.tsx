import { useInternetIdentity } from '../hooks/useInternetIdentity';
import type { Message } from '../backend';
import { Card } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';

interface MessageListProps {
  messages: Message[];
}

export default function MessageList({ messages }: MessageListProps) {
  const { identity } = useInternetIdentity();
  const currentUserId = identity?.getPrincipal().toString();

  if (messages.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No messages yet. Start the conversation!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((message, index) => {
        const isOwnMessage = message.sender.toString() === currentUserId;
        const timestamp = Number(message.timestamp) / 1_000_000;
        const date = new Date(timestamp);

        return (
          <div key={index} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
            <Card className={`max-w-[70%] ${isOwnMessage ? 'bg-primary text-primary-foreground' : ''}`}>
              <div className="p-3">
                <p className="text-sm break-words">{message.content}</p>
                <p className={`text-xs mt-1 ${isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                  {formatDistanceToNow(date, { addSuffix: true })}
                </p>
              </div>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
