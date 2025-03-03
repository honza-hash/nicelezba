import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useChat } from "@/hooks/use-chat";

interface MessageInputProps {
  selectedModel: string;
}

export function MessageInput({ selectedModel }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const { sendMessage } = useChat();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    sendMessage(message, selectedModel);
    setMessage("");
  };

  return (
    <form onSubmit={handleSubmit} className="sticky bottom-0 py-4 bg-gradient-to-t from-background to-transparent">
      <div className="max-w-3xl mx-auto flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Napište zprávu..."
          className="flex-1 bg-muted/10 border-primary/20 backdrop-blur-sm"
        />
        <Button type="submit" className="bg-primary/90 hover:bg-primary">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}