import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";

const models = [
  { id: "gemini-free", name: "Gemini Free", isPro: false },
  { id: "gemini-pro", name: "Gemini Pro", isPro: true },
  { id: "mistral", name: "Mistral 7B", isPro: true },
  { id: "openllama", name: "OpenLLaMA", isPro: true },
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
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select a model" />
      </SelectTrigger>
      <SelectContent>
        {availableModels.map((model) => (
          <SelectItem key={model.id} value={model.id}>
            {model.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
