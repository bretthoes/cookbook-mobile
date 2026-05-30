import { load, remove, save } from "@/utils/storage"

export const zustandPersistStorage = {
  getItem: (name: string) => {
    const value = load<string>(name)
    return value != null ? JSON.stringify(value) : null
  },
  setItem: (name: string, value: string) => {
    save(name, JSON.parse(value))
  },
  removeItem: (name: string) => {
    remove(name)
  },
}
