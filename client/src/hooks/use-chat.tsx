import React, { createContext, useContext, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "./use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";

type Message = {
  id: number;
  content: string;
  modelId: string;
  role: "user" | "assistant";
  timestamp: string;
};

type SessionData = {
  messageCount: number;
};

type ChatContextType = {
  isLoading: boolean;
  messages: Message[];
  sendMessage: (content: string, modelId: string) => Promise<void>;
  sessionData: SessionData | null;
};

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [sessionId] = useState(() => localStorage.getItem("chatSessionId") || uuidv4());

  // Store session ID in local storage
  React.useEffect(() => {
    if (!localStorage.getItem("chatSessionId")) {
      localStorage.setItem("chatSessionId", sessionId);
    }
  }, [sessionId]);

  // Fetch session data
  const { data: sessionData } = useQuery({
    queryKey: ["sessionData", sessionId],
    queryFn: async () => {
      if (user) {
        return { messageCount: 0 }; // For authenticated users, we don't use session count
      } else {
        return apiRequest<SessionData>("GET", `/api/anonymous/session?sessionId=${sessionId}`);
      }
    },
    enabled: !!sessionId,
    retry: false,
  });

  // Fetch messages
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["messages", user?.id, sessionId],
    queryFn: async () => {
      if (user) {
        return apiRequest<Message[]>("GET", "/api/messages");
      } else {
        return apiRequest<Message[]>("GET", `/api/anonymous/messages?sessionId=${sessionId}`);
      }
    },
    enabled: !!sessionId || !!user,
    retry: false,
  });

  // Send message mutation
  const messageMutation = useMutation({
    mutationFn: async (data: { content: string; modelId: string }) => {
      if (user) {
        return apiRequest<Message>("POST", "/api/messages", {
          body: JSON.stringify(data),
        });
      } else {
        return apiRequest<Message>("POST", `/api/anonymous/messages?sessionId=${sessionId}`, {
          body: JSON.stringify(data),
        });
      }
    },
    onSuccess: () => {
      if (user) {
        queryClient.invalidateQueries(["messages", user.id]);
      } else {
        queryClient.invalidateQueries(["messages", null, sessionId]);
        queryClient.invalidateQueries(["sessionData", sessionId]);
      }
    },
  });

  const sendMessage = async (content: string, modelId: string) => {
    await messageMutation.mutateAsync({ content, modelId });
  };

  return (
    <ChatContext.Provider
      value={{
        isLoading,
        messages,
        sendMessage,
        sessionData: sessionData || { messageCount: 0 },
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