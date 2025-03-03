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
    <form onSubmit={handleSubmit} className="flex gap-2 p-4">
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        className="flex-1"
      />
      <Button type="submit">
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}
