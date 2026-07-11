import { useEffect } from 'react'
import { fetchNui } from '../utils/fetchNui'

/**
 * While the NUI is focused it keeps all keyboard/mouse input, so the player can
 * type in fields without game keybinds firing. Holding right click temporarily
 * hands input back to the game (look around / move); releasing it takes it away.
 */
export const useGameControlListener = () => {
  useEffect(() => {
    const grantGameInput = () => fetchNui('dolu_tool:setGameInput', true)
    const revokeGameInput = () => fetchNui('dolu_tool:setGameInput', false)

    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 2) grantGameInput()
    }
    const onMouseUp = (e: MouseEvent) => {
      if (e.button === 2) revokeGameInput()
    }
    // Suppress the browser context menu; right click is used to control the game.
    const onContextMenu = (e: MouseEvent) => e.preventDefault()

    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)
    // Safety net: never leave input granted if focus is lost while held.
    window.addEventListener('blur', revokeGameInput)
    window.addEventListener('contextmenu', onContextMenu)

    return () => {
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('blur', revokeGameInput)
      window.removeEventListener('contextmenu', onContextMenu)
    }
  }, [])
}
