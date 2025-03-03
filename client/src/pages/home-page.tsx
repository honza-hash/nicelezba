import { useState } from "react";
import { ChatProvider } from "@/hooks/use-chat";
import { ChatWindow } from "@/components/chat/chat-window";
import { ModelSelector } from "@/components/chat/model-selector";
import { MessageInput } from "@/components/chat/message-input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { LogOut } from "lucide-react";

export default function HomePage() {
  const [selectedModel, setSelectedModel] = useState("gemini-free");
  const { user, logoutMutation } = useAuth();

  return (
    <ChatProvider>
      <div className="min-h-screen flex flex-col">
        <header className="border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">AI Chat</h1>
            <ModelSelector
              value={selectedModel}
              onValueChange={setSelectedModel}
            />
          </div>
          <div className="flex items-center gap-4">
            <span>
              {user?.username} {user?.isPro && "(PRO)"}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => logoutMutation.mutate()}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>
        
        <main className="flex-1 flex flex-col">
          <ChatWindow />
          <MessageInput selectedModel={selectedModel} />
        </main>
      </div>
    </ChatProvider>
  );
}
