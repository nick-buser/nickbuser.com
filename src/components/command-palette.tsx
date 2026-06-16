"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";

export interface SearchItem {
  title: string;
  href: string;
  group: string;
  description?: string;
}

interface CommandPaletteContextValue {
  open: boolean;
  setOpen: (value: boolean) => void;
  toggle: () => void;
}

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(
  null,
);

export function useCommandPalette(): CommandPaletteContextValue {
  const ctx = useContext(CommandPaletteContext);
  if (!ctx) {
    throw new Error(
      "useCommandPalette must be used within a CommandPaletteProvider",
    );
  }
  return ctx;
}

export function CommandPaletteProvider({
  items,
  children,
}: {
  items: SearchItem[];
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const toggle = useCallback(() => setOpen((o) => !o), []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggle();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [toggle]);

  const run = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router],
  );

  const groups = Array.from(new Set(items.map((i) => i.group)));

  return (
    <CommandPaletteContext.Provider value={{ open, setOpen, toggle }}>
      {children}
      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        label="Site command menu"
      >
        <Command.Input placeholder="Search pages, writing, work…" />
        <Command.List>
          <Command.Empty>No results found.</Command.Empty>
          {groups.map((group) => (
            <Command.Group key={group} heading={group}>
              {items
                .filter((i) => i.group === group)
                .map((i) => (
                  <Command.Item
                    key={i.href}
                    value={`${i.title} ${i.description ?? ""}`}
                    onSelect={() => run(i.href)}
                  >
                    <span>{i.title}</span>
                    {i.description ? (
                      <span
                        style={{
                          fontSize: 12,
                          color: "var(--muted-foreground)",
                        }}
                      >
                        {i.description}
                      </span>
                    ) : null}
                  </Command.Item>
                ))}
            </Command.Group>
          ))}
        </Command.List>
      </Command.Dialog>
    </CommandPaletteContext.Provider>
  );
}
