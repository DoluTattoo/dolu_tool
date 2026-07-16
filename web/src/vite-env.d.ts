/// <reference types='vite/client' />

interface Window {
  invokeNative: (native: string, arg: string) => void;
  GetParentResourceName: () => string;
}

type GizmoEditorMode = "translate" | "rotate" | "scale" | undefined;
type GizmoSpaceMode = "world" | "local";

interface Vec3 {
  x: number;
  y: number;
  z: number;
}

interface EntityTransform {
  position: Vec3;
  rotation: Vec3;
}

interface TransformEntity extends EntityTransform {
  name: string;
  hash: number;
  handle: number;
  id?: string;
}

interface ModeSelector {
  onChangeSpace: () => void;
  onChangeMode: (value: GizmoEditorMode) => void;
  space: GizmoSpaceMode;
  mode: GizmoEditorMode;
  currentEntity: TransformEntity | undefined;
}

interface TransformComponent extends ModeSelector {
  currentEntity: TransformEntity | undefined;
  onChangeSpace?: () => void;
  setCurrentEntity: React.Dispatch<React.SetStateAction<TransformEntity | undefined>>;
  onChangeMode?: (value: GizmoEditorMode) => void;

  onMouseUp?: (e?: THREE.Event) => void;
  onMouseDown?: (e?: THREE.Event) => void;
}
