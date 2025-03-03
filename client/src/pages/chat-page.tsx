import { useState, useEffect } from "react";
import { nanoid } from "nanoid";
import { ChatProvider } from "@/hooks/use-chat";
import { ChatWindow } from "@/components/chat/chat-window";
import { ModelSelector } from "@/components/chat/model-selector";
import { MessageInput } from "@/components/chat/message-input";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function ChatPage() {
  const [selectedModel, setSelectedModel] = useState("gemini-free");
  const [sessionId] = useState(() => localStorage.getItem("anonymousSessionId") || nanoid());
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  useEffect(() => {
    localStorage.setItem("anonymousSessionId", sessionId);
  }, [sessionId]);

  return (
    <ChatProvider isAnonymous sessionId={sessionId}>
      <div className="min-h-screen flex flex-col bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
        <header className="border-b border-primary/20 backdrop-blur-sm bg-background/50 sticky top-0 z-10">
          <div className="container mx-auto flex items-center justify-between h-16 px-4">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold">ai.ihos.eu</h1>
              <ModelSelector
                value={selectedModel}
                onValueChange={setSelectedModel}
              />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Anonymní režim (zbývá zpráv: {70 - messageCount})
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation("/auth")}
              >
                <LogIn className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col container mx-auto px-4">
          <ChatWindow />
          <MessageInput selectedModel={selectedModel} />
        </main>
      </div>
    </ChatProvider>
  );
}
