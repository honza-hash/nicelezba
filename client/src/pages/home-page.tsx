import { useState } from "react";
import { ChatProvider } from "@/hooks/use-chat";
import { ChatWindow } from "@/components/chat/chat-window";
import { ModelSelector } from "@/components/chat/model-selector";
import { MessageInput } from "@/components/chat/message-input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { LogOut, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function HomePage() {
  const [selectedModel, setSelectedModel] = useState("gemini-free");
  const { user, logoutMutation } = useAuth();

  return (
    <ChatProvider>
      <div className="min-h-screen flex flex-col bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
        <header className="border-b border-primary/20 backdrop-blur-sm bg-background/50 sticky top-0 z-10">
          <div className="container mx-auto flex items-center justify-between h-16 px-4">
            <div className="flex items-center gap-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64">
                  <div className="space-y-4 py-4">
                    <h2 className="text-lg font-semibold">AI Modely</h2>
                    <ModelSelector
                      value={selectedModel}
                      onValueChange={setSelectedModel}
                    />
                  </div>
                </SheetContent>
              </Sheet>
              <h1 className="text-xl font-bold">ai.ihos.eu</h1>
              <div className="hidden lg:block">
                <ModelSelector
                  value={selectedModel}
                  onValueChange={setSelectedModel}
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
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