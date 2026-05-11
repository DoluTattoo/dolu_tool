import React, { useCallback } from 'react'
import { PerspectiveCamera } from '@react-three/drei'
import { useNuiValidatedEvent } from '../../hooks/useNuiValidatedEvent'
import { useThree } from '@react-three/fiber'
import { MathUtils } from 'three'
import { cameraPositionSchema } from '../../atoms/object'

export const CameraComponent = React.memo(() => {
  const { camera } = useThree()

  const zRotationHandler = useCallback((t: number, e: number): number => {
    return t > 0 && t < 90 ? e : (t > -180 && t < -90) || t > 0 ? -e : e
  }, []);

  useNuiValidatedEvent('setCameraPosition', cameraPositionSchema, ({ position, rotation }) => {
    camera.position.set(position.x, position.z, -position.y)
    camera.rotation.order = 'YZX'

    rotation && camera.rotation.set(
      MathUtils.degToRad(rotation.x),
      MathUtils.degToRad(zRotationHandler(rotation.x, rotation.z)),
      MathUtils.degToRad(rotation.y)
    )

    camera.updateProjectionMatrix()
  })

  return (
    <PerspectiveCamera position={[0, 0, 10]} makeDefault onUpdate={(self: any) => self.updateProjectionMatrix()} />
  )
});
