import React, { useCallback, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { useAtomValue } from 'jotai'
import { CameraComponent } from './CameraComponent'
import { TransformComponent } from './TransformComponent'
import { ModeSelector } from './ModeSelector'
import { fetchNui } from '../../utils/fetchNui'
import { KeyboardLayoutAtom } from '../../atoms/object'

export const ThreeComponent = React.memo(() => {
  const [editorMode, setEditorMode] = useState<GizmoEditorMode>('translate')
  const [spaceMode, setSpaceMode] = useState<GizmoSpaceMode>('world')
  const [entity, setEntity] = useState<TransformEntity | undefined>()
  const [drag, setDrag] = useState<boolean>(false)
  const layout = useAtomValue(KeyboardLayoutAtom)

  const toggleSpaceMode = useCallback((): void => {
    setSpaceMode(spaceMode === 'world' ? 'local' : 'world')
  }, [spaceMode])


  const keyHandler = useCallback((e: KeyboardEvent): void => {
      const rotate = 'KeyR'
      const translate = layout === 'QWERTY' ? 'KeyW' : 'KeyZ'
      const spaceMode = layout === 'QWERTY' ? 'KeyQ' : 'KeyA'

      if (e.code === rotate && editorMode !== 'rotate') {
        setEditorMode('rotate')
      }

      if (editorMode !== 'translate' && e.code === translate) {
        setEditorMode('translate')
      }

      if (e.code === spaceMode) {
        toggleSpaceMode()
      }
    },
    [editorMode, spaceMode, layout]
  )

  const mouseHandler = useCallback((e: any): void => {
    if (e.target?.tagName !== 'CANVAS' || e.button !== 0 || drag) return
    fetchNui('dolu_tool:selectEntity')
  }, [drag])

  const setDragging = useCallback((value: boolean): void => setDrag(value), [drag])

  useEffect(() => {
    window.addEventListener('keyup', keyHandler)
    window.addEventListener('mousedown', mouseHandler)

    return () => {
      window.removeEventListener('keyup', keyHandler)
      window.removeEventListener('mousedown', mouseHandler)
    }
  }, [editorMode, spaceMode, toggleSpaceMode, setEditorMode, mouseHandler])

  return (
    <>
      <Canvas style={{ zIndex: 1 }}>
        <CameraComponent />
        <TransformComponent onMouseUp={() => setDragging(false)} onMouseDown={() => setDragging(true)} onChangeSpace={toggleSpaceMode} onChangeMode={setEditorMode} space={spaceMode} mode={editorMode} currentEntity={entity} setCurrentEntity={setEntity} />
      </Canvas>

      {entity && <ModeSelector onChangeSpace={toggleSpaceMode} onChangeMode={setEditorMode} space={spaceMode} mode={editorMode} currentEntity={entity} />}
    </>
  )
})
