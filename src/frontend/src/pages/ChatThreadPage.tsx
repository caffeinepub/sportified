import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetConversation, useSendMessage, useGetProfile } from '../hooks/useQueries';
import { LoadingState } from '../components/QueryStates';
import MessageList from '../components/MessageList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function ChatThreadPage() {
  const navigate = useNavigate();
  const { userId } = useParams({ from: '/messages/$userId' });
  const { identity } = useInternetIdentity();
  const { data: messages, isLoading, refetch } = useGetConversation(userId);
  const { data: otherProfile } = useGetProfile(userId);
  const sendMessage = useSendMessage();
  const [content, setContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!identity) {
      navigate({ to: '/sign-in' });
    }
  }, [identity, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!identity) return null;

  if (isLoading) {
    return <LoadingState message="Loading conversation..." />;
  }

  const handleSend = async () => {
    const trimmed = content.trim();
    if (!trimmed) {
      toast.error('Please enter a message');
      return;
    }

    try {
      await sendMessage.mutateAsync({ to: userId, content: trimmed });
      setContent('');
      setTimeout(() => refetch(), 500);
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/messages' })}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{otherProfile?.name || 'Chat'}</h1>
          <p className="text-sm text-muted-foreground truncate max-w-[300px]">{userId}</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="h-[500px] overflow-y-auto mb-4 space-y-3">
            <MessageList messages={messages || []} />
            <div ref={messagesEndRef} />
          </div>

          <div className="flex gap-2">
            <Textarea
              placeholder="Type your message..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={2}
            />
            <Button onClick={handleSend} disabled={sendMessage.isPending} size="icon" className="self-end">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
