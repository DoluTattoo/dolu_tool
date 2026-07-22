import { useEffect } from 'react'
import { fetchNui } from '../utils/fetchNui'
import { codeToKeyName } from '../utils/keys'
import { keybindCapture } from '../utils/keybindCapture'
import { Keybind } from '../atoms/keybinds'

const isEditable = (target: EventTarget | null): boolean => {
  const node = target as HTMLElement | null
  if (!node) return false
  const tag = node.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || node.isContentEditable
}

/**
 * While the menu is open the NUI owns the keyboard, so the client cannot detect
 * raw key presses. This mirrors the keybinds in JS and forwards them to the
 * client, letting shortcuts (noclip, teleport, ...) work without holding right
 * click. Opening the menu is excluded (it is already open, Escape closes it).
 */
export const useMenuKeybinds = (visible: boolean, keybinds: Keybind[]) => {
  useEffect(() => {
    if (!visible) return

    const handler = (e: KeyboardEvent) => {
      if (keybindCapture.active) return
      if (isEditable(e.target)) return

      const key = codeToKeyName(e)
      if (!key || key === 'CTRL' || key === 'ALT' || key === 'SHIFT') return

      const parts: string[] = []
      if (e.ctrlKey) parts.push('CTRL')
      if (e.altKey) parts.push('ALT')
      if (e.shiftKey) parts.push('SHIFT')
      parts.push(key)
      const combo = parts.join('+')

      const match = keybinds.find((kb) => kb.name !== 'openMenu' && kb.key === combo)
      if (match) {
        e.preventDefault()
        fetchNui('dolu_tool:triggerKeybind', match.name)
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [visible, keybinds])
}
