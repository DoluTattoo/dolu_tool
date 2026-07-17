import { useEffect, useRef } from 'react'
import { closeAllModals } from '@mantine/modals'
import { noop } from '../utils/misc'
import { fetchNui } from '../utils/fetchNui'
import { keybindCapture } from '../utils/keybindCapture'

type FrameVisibleSetter = (bool: boolean) => void

const LISTENED_KEYS = ['Escape']

// Basic hook to listen for key presses in NUI in order to exit
export const useExitListener = (visibleSetter: FrameVisibleSetter, cb?: () => void) => {
  const setterRef = useRef<FrameVisibleSetter>(noop)

  useEffect(() => {
    setterRef.current = visibleSetter
  }, [visibleSetter])

  useEffect(() => {
    const keyHandler = (e: KeyboardEvent) => {
      if (LISTENED_KEYS.includes(e.code)) {
        // Escape is also used to cancel a keybind capture; swallow the keyup
        // that follows the cancel, and never close while a capture is active.
        if (keybindCapture.swallowEscapeUp) {
          keybindCapture.swallowEscapeUp = false
          return
        }
        if (keybindCapture.active) return

        closeAllModals()
        setterRef.current(false)
        cb && cb()
        fetchNui('dolu_tool:exit')
      }
    }

    window.addEventListener('keyup', keyHandler)

    return () => window.removeEventListener('keyup', keyHandler)
  }, [])
}
