import { Switch } from "@/components/UI/Switch";
import { Label } from "@/components/UI/Label";

export default function SettingsDemo() {
  return (
    <div className="flex items-center gap-4 p-6">
      <Label htmlFor="dark-mode">Dark Mode</Label>
      <Switch id="dark-mode" />
    </div>
  );
}
