import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <Card className="p-8 animate-fade-in">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="rounded-full bg-primary/10 p-6">
          <Icon className="h-12 w-12 text-primary" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">{title}</h3>
          <p className="text-muted-foreground max-w-md">{description}</p>
        </div>
        {action && (
          <Button onClick={action.onClick} className="hover-scale">
            {action.label}
          </Button>
        )}
      </div>
    </Card>
  );
}
