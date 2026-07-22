import { useEffect } from 'react'

/**
 * The menu is opened with keepInput enabled so the game can read the right mouse
 * button itself (see controls.lua) to look around with the noclip camera. This hook
 * just suppresses the browser context menu so right click never opens it.
 */
export const useSuppressContextMenu = () => {
  useEffect(() => {
    const onContextMenu = (e: MouseEvent) => e.preventDefault()

    window.addEventListener('contextmenu', onContextMenu, true)

    return () => window.removeEventListener('contextmenu', onContextMenu, true)
  }, [])
}
