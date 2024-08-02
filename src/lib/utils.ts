import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Store } from "@tauri-apps/plugin-store";
import { AuthenticateClientResponse } from "./machines/clientOperationsMachine";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export class StorageManager {
  private store: Store;

  constructor(storeName: string) {
    this.store = new Store(`${storeName}`);
  }

  async setItem(key: string, value: any): Promise<void> {
    await this.store.set(key, value);
  }

  async getItem<T>(key: string): Promise<T | null> {
    if (this.store) {
      return await this.store.get(key);
    }
    return null;
  }

  async save(): Promise<void> {
    await this.store.save();
  }
}

export async function getClientId() {
  const store = new StorageManager("store.bin");

  const session =
    await store.getItem<AuthenticateClientResponse>("client_session");

  return session?.client_id;
}
