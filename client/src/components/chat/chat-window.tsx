import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { User, Bot } from "lucide-react";
import { useChat } from "@/hooks/use-chat";
import { cn } from "@/lib/utils";

export function ChatWindow() {
  const { messages, isLoading } = useChat();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-180px)]">
        <div className="animate-pulse text-muted-foreground">
          Načítání zpráv...
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-180px)] py-8">
      <div className="space-y-6 max-w-3xl mx-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex items-start gap-3",
              message.role === "user" ? "flex-row-reverse" : ""
            )}
          >
            <Avatar className={cn(
              "h-8 w-8 border-2",
              message.role === "user" 
                ? "border-primary bg-primary/10" 
                : "border-muted bg-muted/10"
            )}>
              {message.role === "user" ? (
                <User className="h-4 w-4" />
              ) : (
                <Bot className="h-4 w-4" />
              )}
            </Avatar>
            <div
              className={cn(
                "rounded-lg p-4 max-w-[80%] backdrop-blur-sm",
                message.role === "user"
                  ? "bg-primary/10 border border-primary/20"
                  : "bg-muted/10 border border-muted/20"
              )}
            >
              <div className="text-sm mb-1 text-muted-foreground">
                {message.role === "user" ? "Vy" : message.modelId}
              </div>
              {message.content}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}