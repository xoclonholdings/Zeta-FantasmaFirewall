import * as React from "react";

import type { ToastActionElement, ToastProps } from "@/components/ui/toast";

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 5000;

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

type State = {
  toasts: ToasterToast[];
};

const listeners = new Set<(state: State) => void>();
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

let memoryState: State = {
  toasts: [],
};

function dispatch(state: State) {
  memoryState = state;
  listeners.forEach((listener) => listener(memoryState));
}

function removeToast(id: string) {
  dispatch({
    toasts: memoryState.toasts.filter((toast) => toast.id !== id),
  });
}

function scheduleRemoval(id: string) {
  if (toastTimeouts.has(id)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(id);
    removeToast(id);
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(id, timeout);
}

export function toast({
  title,
  description,
  action,
  ...props
}: Omit<ToasterToast, "id">) {
  const id = crypto.randomUUID();
  const nextToast: ToasterToast = {
    id,
    title,
    description,
    action,
    open: true,
    onOpenChange: (open) => {
      if (!open) {
        removeToast(id);
      }
    },
    ...props,
  };

  dispatch({
    toasts: [nextToast, ...memoryState.toasts].slice(0, TOAST_LIMIT),
  });

  scheduleRemoval(id);

  return {
    id,
    dismiss: () => removeToast(id),
  };
}

export function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.add(setState);
    return () => {
      listeners.delete(setState);
    };
  }, []);

  return {
    ...state,
    toast,
    dismiss: removeToast,
  };
}
