"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { STORAGE_KEYS } from "@/lib/constants";
import {
  DEFAULT_ACCOUNT_ID,
  createDefaultAccount,
} from "@/lib/accountTypes";
import type { AccountProfile } from "@/lib/accountTypes";

// ─── Storage Helpers ──────────────────────────────────────────────────────────

function readAccounts(): AccountProfile[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    return raw ? (JSON.parse(raw) as AccountProfile[]) : [];
  } catch {
    return [];
  }
}

function writeAccounts(accounts: AccountProfile[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
}

function readActiveAccountId(): string {
  if (typeof window === "undefined") return DEFAULT_ACCOUNT_ID;
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_ACCOUNT) ?? DEFAULT_ACCOUNT_ID;
}

function writeActiveAccountId(id: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.ACTIVE_ACCOUNT, id);
}

// ─── Context Shape ────────────────────────────────────────────────────────────

interface AccountContextValue {
  accounts: AccountProfile[];
  activeAccount: AccountProfile;
  switchAccount: (id: string) => void;
  addAccount: (profile: Omit<AccountProfile, "id" | "createdAt">) => AccountProfile;
  updateAccount: (updated: AccountProfile) => void;
  archiveAccount: (id: string) => void;
}

const AccountContext = createContext<AccountContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState<AccountProfile[]>([]);
  const [activeId, setActiveId] = useState<string>(DEFAULT_ACCOUNT_ID);

  // Bootstrap: load or create default account
  useEffect(() => {
    let loaded = readAccounts();
    if (loaded.length === 0) {
      const def = createDefaultAccount();
      loaded = [def];
      writeAccounts(loaded);
    } else if (!loaded.find((a) => a.id === DEFAULT_ACCOUNT_ID)) {
      // Ensure default account always exists
      const def = createDefaultAccount();
      loaded = [def, ...loaded];
      writeAccounts(loaded);
    }
    setAccounts(loaded);

    const savedId = readActiveAccountId();
    const valid = loaded.find((a) => a.id === savedId && !a.archivedAt);
    setActiveId(valid ? savedId : DEFAULT_ACCOUNT_ID);
  }, []);

  const switchAccount = useCallback((id: string) => {
    setActiveId(id);
    writeActiveAccountId(id);
  }, []);

  const addAccount = useCallback(
    (profile: Omit<AccountProfile, "id" | "createdAt">) => {
      const newAccount: AccountProfile = {
        ...profile,
        id: `acc_${Date.now().toString(36)}`,
        createdAt: new Date().toISOString(),
      };
      setAccounts((prev) => {
        const next = [...prev, newAccount];
        writeAccounts(next);
        return next;
      });
      return newAccount;
    },
    []
  );

  const updateAccount = useCallback((updated: AccountProfile) => {
    setAccounts((prev) => {
      const next = prev.map((a) => (a.id === updated.id ? updated : a));
      writeAccounts(next);
      return next;
    });
  }, []);

  const archiveAccount = useCallback(
    (id: string) => {
      if (id === DEFAULT_ACCOUNT_ID) return; // cannot archive default
      setAccounts((prev) => {
        const next = prev.map((a) =>
          a.id === id ? { ...a, archivedAt: new Date().toISOString() } : a
        );
        writeAccounts(next);
        return next;
      });
      // Fall back to default if archiving active account
      if (id === activeId) {
        switchAccount(DEFAULT_ACCOUNT_ID);
      }
    },
    [activeId, switchAccount]
  );

  const activeAccount =
    accounts.find((a) => a.id === activeId) ??
    accounts.find((a) => a.id === DEFAULT_ACCOUNT_ID) ??
    createDefaultAccount();

  return (
    <AccountContext.Provider
      value={{
        accounts,
        activeAccount,
        switchAccount,
        addAccount,
        updateAccount,
        archiveAccount,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useAccount(): AccountContextValue {
  const ctx = useContext(AccountContext);
  if (!ctx) throw new Error("useAccount must be used inside <AccountProvider>");
  return ctx;
}

export function useActiveAccountId(): string {
  return useAccount().activeAccount.id;
}
