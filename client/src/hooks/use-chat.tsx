import { createContext, ReactNode, useContext } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Message } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ChatContextType {
  messages: Message[];
  isLoading: boolean;
  sendMessage: (content: string, modelId: string) => void;
  messageCount?: number;
}

interface ChatProviderProps {
  children: ReactNode;
  isAnonymous?: boolean;
  sessionId?: string;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children, isAnonymous, sessionId }: ChatProviderProps) {
  const { toast } = useToast();

  const messagesQueryKey = isAnonymous 
    ? ["/api/anonymous/messages", sessionId]
    : ["/api/messages"];

  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: messagesQueryKey,
  });

  const sessionQuery = useQuery<{ messageCount: number }>({
    queryKey: ["/api/anonymous/session", sessionId],
    enabled: isAnonymous && !!sessionId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, modelId }: { content: string; modelId: string }) => {
      const endpoint = isAnonymous ? `/api/anonymous/messages?sessionId=${sessionId}` : "/api/messages";
      const res = await apiRequest("POST", endpoint, { content, modelId });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messagesQueryKey });
      if (isAnonymous) {
        queryClient.invalidateQueries({ queryKey: ["/api/anonymous/session", sessionId] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <ChatContext.Provider
      value={{
        messages,
        isLoading,
        messageCount: sessionQuery.data?.messageCount,
        sendMessage: (content: string, modelId: string) =>
          sendMessageMutation.mutate({ content, modelId }),
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}