import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";

const models = [
  { 
    id: "gemini-free", 
    name: "Gemini", 
    description: "Rychlý a efektivní model od Google",
    apiUrl: "https://makersuite.google.com/app/apikey",
    isPro: false 
  },
  { 
    id: "mistral-7b", 
    name: "Mistral 7B", 
    description: "Open-source model s výborným poměrem výkon/velikost",
    apiUrl: "https://mistral.ai/",
    isPro: true 
  },
  { 
    id: "claude-3", 
    name: "Claude 3", 
    description: "Pokročilý model od Anthropic",
    apiUrl: "https://www.anthropic.com/claude",
    isPro: true 
  },
  { 
    id: "llama-2", 
    name: "LLaMA 2", 
    description: "Výkonný open-source model od Meta",
    apiUrl: "https://ai.meta.com/llama/",
    isPro: true 
  },
];

interface ModelSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function ModelSelector({ value, onValueChange }: ModelSelectorProps) {
  const { user } = useAuth();

  const availableModels = models.filter(
    (model) => !model.isPro || user?.isPro
  );

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[200px] bg-muted/10 border-primary/20">
        <SelectValue placeholder="Vyberte model" />
      </SelectTrigger>
      <SelectContent>
        {availableModels.map((model) => (
          <SelectItem 
            key={model.id} 
            value={model.id}
            className="flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-2">
                {model.name}
                {model.isPro && (
                  <Badge variant="secondary" className="text-xs">PRO</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {model.description}
              </p>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}