import React, { Suspense, useRef, useCallback, useState, useEffect } from 'react'
import { TransformControls } from '@react-three/drei'
import { Mesh, MathUtils } from 'three'
import { useAtomValue, useSetAtom } from 'jotai'
import { useNuiEvent } from '../../hooks/useNuiEvent'
import { fetchNui } from '../../utils/fetchNui'
import { Entity, ObjectListAtom, RotateSnapAtom, TranslateSnapAtom } from '../../atoms/object'

// Convert the three.js mesh transform back to game-space coordinates
const getGameTransform = (mesh: Mesh): EntityTransform => ({
  position: {
    x: mesh.position.x,
    y: -mesh.position.z,
    z: mesh.position.y
  },
  rotation: {
    x: MathUtils.radToDeg(mesh.rotation.x),
    y: MathUtils.radToDeg(-mesh.rotation.z),
    z: MathUtils.radToDeg(mesh.rotation.y)
  }
})

export const TransformComponent = React.memo(({ space, mode, currentEntity, setCurrentEntity, onMouseUp, onMouseDown }: TransformComponent) => {
  const mesh = useRef<Mesh>(null!);
  const translateSnap = useAtomValue(TranslateSnapAtom);
  const rotateSnap = useAtomValue(RotateSnapAtom);
  const setObjectList = useSetAtom(ObjectListAtom);
  const [shiftPressed, setShiftPressed] = useState(false);

  useNuiEvent<TransformEntity>('setGizmoEntity', (entity: TransformEntity | undefined): void => {
    setCurrentEntity(entity);

    // If entity is undefined or missing required data, clear the gizmo
    if (!entity || !entity.position || !entity.rotation) {
      setCurrentEntity(undefined);
      return;
    };

    mesh.current.rotation.order = 'YZX'
    mesh.current.position.set(entity.position.x, entity.position.z, -entity.position.y);
    mesh.current.rotation.set(MathUtils.degToRad(entity.rotation.x), MathUtils.degToRad(entity.rotation.z), MathUtils.degToRad(-entity.rotation.y));
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey) {
        setShiftPressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.shiftKey) {
        setShiftPressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleObjectDataUpdate = useCallback((): void => {
    const transform = getGameTransform(mesh.current);

    // Keep the NUI display (ModeSelector infos) in sync in real time while dragging
    setCurrentEntity(entity => entity && { ...entity, ...transform });

    // Apply the transform to the game entity
    fetchNui('dolu_tool:updateGizmoTransform', transform);
  }, [setCurrentEntity]);

  const handleMouseDown = useCallback(() => {
    onMouseDown?.()

    // Notify Lua if SHIFT is pressed in translate mode
    if (shiftPressed && mode === 'translate') {
      fetchNui('dolu_tool:gizmoDragStart', {
        shiftPressed: true,
        ...getGameTransform(mesh.current)
      });
    }
  }, [shiftPressed, mode, onMouseDown]);

  const handleMouseUp = useCallback(async () => {
    onMouseUp?.();

    // Sync the final transform to the object list, straight from the callback response
    const entity = await fetchNui<Entity | false>('dolu_tool:gizmoDragEnd');

    if (entity) {
      setObjectList(list => list.map(item => item.id === entity.id ? entity : item));
    }
  }, [onMouseUp, setObjectList]);

  return (
    <>
      <Suspense fallback={<p>Loading Gizmo</p>}>
        {currentEntity && <TransformControls onMouseUp={handleMouseUp} onMouseDown={handleMouseDown} space={space} size={0.5} object={mesh} mode={mode} translationSnap={translateSnap} rotationSnap={rotateSnap} onObjectChange={handleObjectDataUpdate} />}
        <mesh ref={mesh} />
      </Suspense>
    </>
  )
});
