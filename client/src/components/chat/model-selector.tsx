
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
    id: "deepseek-r1-distil-llama-70b",
    name: "DeepSeek R1 Distil Llama 70B",
    description: "Vysoce výkonný open-source model, optimalizovaný pro efektivitu",
    apiUrl: "https://openrouter.ai/",
    isPro: false
  },
  { 
    id: "openrouter/mistralai/mistral-7b-instruct:free", 
    name: "Mistral 7B", 
    description: "Open-source model s výborným poměrem výkon/velikost",
    apiUrl: "https://openrouter.ai/",
    isPro: false 
  },
  { 
    id: "openrouter/meta-llama/llama-3-8b-instruct:free", 
    name: "Llama 3 8B", 
    description: "Nejnovější open-source model od Meta",
    apiUrl: "https://openrouter.ai/",
    isPro: false
  },
];

interface ModelSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function ModelSelector({ value, onValueChange }: ModelSelectorProps) {
  const { user } = useAuth();

  // All models are available to all users
  const availableModels = models;

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
