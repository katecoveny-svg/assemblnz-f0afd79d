import { toast } from "sonner";

export function showWorkflowToast(message: string, description?: string) {
  toast(message, {
    description,
    duration: 3000,
    style: {
      background: "hsl(220 18% 10%)",
      border: "1px solid hsl(164 37% 35%)",
      color: "hsl(164 37% 35%)",
    },
  });
}
