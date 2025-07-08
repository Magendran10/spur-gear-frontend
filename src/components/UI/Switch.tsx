import React, { useState } from "react";

export function Switch({ id, defaultChecked = false, onChange }: {
  id?: string;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
}) {
  const [enabled, setEnabled] = useState(defaultChecked);

  const toggle = () => {
    setEnabled((prev) => {
      const next = !prev;
      onChange?.(next);
      return next;
    });
  };

  return (
    <button
      type="button"
      id={id}
      aria-pressed={enabled}
      onClick={toggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}
