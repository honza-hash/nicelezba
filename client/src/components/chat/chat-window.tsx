import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { User, Bot } from "lucide-react";
import { useChat } from "@/hooks/use-chat";

export function ChatWindow() {
  const { messages, isLoading } = useChat();

  if (isLoading) {
    return <div>Loading messages...</div>;
  }

  return (
    <ScrollArea className="h-[calc(100vh-180px)] p-4">
      <div className="space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-3 ${
              message.role === "user" ? "flex-row-reverse" : ""
            }`}
          >
            <Avatar className="h-8 w-8">
              {message.role === "user" ? (
                <User className="h-4 w-4" />
              ) : (
                <Bot className="h-4 w-4" />
              )}
            </Avatar>
            <div
              className={`rounded-lg p-4 max-w-[80%] ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
