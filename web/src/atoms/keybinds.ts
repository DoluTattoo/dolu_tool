import { atom } from 'jotai'

export interface Keybind {
  name: string
  // Canonical combo string (e.g. 'ALT+F3'), or false when the action is unbound.
  key: string | false
  default: string | false
  // Required actions cannot be unbound (e.g. opening the menu).
  required: boolean
}

export const keybindsAtom = atom<Keybind[]>([])
