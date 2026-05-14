/// <reference types='vite/client' />

interface Window {
  invokeNative: (native: string, arg: string) => void;
  GetParentResourceName: () => string;
}

type GizmoEditorMode = "translate" | "rotate" | "scale" | undefined;
type GizmoSpaceMode = "world" | "local";

interface TransformEntity {
  name: string;
  hash: number;
  handle: number;
  position: THREE.Vector3;
  rotation: THREE.Vector3;
  id?: string;
}

interface ModeSelector {
  onChangeSpace: () => void;
  onChangeMode: (value: GizmoEditorMode) => void;
  space: GizmoSpaceMode;
  mode: GizmoEditorMode;
  currentEntity: TransformEntity | undefined;
}

interface TransformComponentProps extends ModeSelector {
  currentEntity: TransformEntity | undefined;
  onChangeSpace?: () => void;
  /** Matches `useState` setter; supports functional updates for stable callbacks. */
  setCurrentEntity: (
    value:
      | TransformEntity
      | undefined
      | ((prev: TransformEntity | undefined) => TransformEntity | undefined),
  ) => void;
  onChangeMode?: (value: GizmoEditorMode) => void;

  onMouseUp?: (e?: THREE.Event) => void;
  onMouseDown?: (e?: THREE.Event) => void;
}
