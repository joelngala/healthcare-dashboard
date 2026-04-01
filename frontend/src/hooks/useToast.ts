import { useSyncExternalStore, useCallback } from "react";

export interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

let toasts: Toast[] = [];
let nextId = 0;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function getSnapshot() {
  return toasts;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function addToast(message: string, type: "success" | "error" = "success") {
  const id = nextId++;
  toasts = [...toasts, { id, message, type }];
  emit();
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    emit();
  }, 3000);
}

export function useToasts() {
  const current = useSyncExternalStore(subscribe, getSnapshot);
  const toast = useCallback(
    (message: string, type: "success" | "error" = "success") =>
      addToast(message, type),
    []
  );
  return { toasts: current, toast };
}
