import { atom, useAtomValue } from 'jotai'

export interface PedProp {
  name: string,
  hash?: number
}

const mockPedList: PedProp[] = [
    {
      name: "A_F_M_BodyBuild_01",
      hash: -1051758075
    },
    {
      name: "A_F_M_Business_02",
      hash: 955823835
    },
]

export interface PedVariation {
  id: number,
  drawable: number,
  drawableCount: number,
  texture: number,
  textureCount: number,
}

export interface PedTarget {
  id: string,
  name?: string,
  handle?: number,
}

export interface PedAnimationClip {
  dict: string,
  clip: string,
}

export type PedActiveAnimation = (PedAnimationClip & { flags: number, scenario?: undefined }) | { scenario: string, dict?: undefined, clip?: undefined }

export interface PedEditorState {
  target: string,
  targets: PedTarget[],
  model: string,
  components: PedVariation[],
  props: PedVariation[],
  animation: PedActiveAnimation | false,
  recentAnimations: PedAnimationClip[],
}

export interface PedAnimationForm extends PedAnimationClip {
  blendIn: number,
  blendOut: number,
  duration: number,
  flags: number,
  startPhase: number,
}

export const PLAYER_TARGET = 'player'

export const pedViewAtom = atom<string>('browse')
export const pedTargetAtom = atom<string>(PLAYER_TARGET)
export const pedEditorAtom = atom<PedEditorState | null>(null)
export const pedAnimationFormAtom = atom<PedAnimationForm>({
  dict: '',
  clip: '',
  blendIn: 8.0,
  blendOut: -8.0,
  duration: -1,
  flags: 1,
  startPhase: 0.0,
})
export const pedScenarioAtom = atom<string>('')

export const pedListSearchAtom = atom<string>('')
export const pedsActivePageAtom = atom<number>(1)
export const pedsPageCountAtom = atom<number>(1)
export const pedsPageContentAtom = atom<PedProp[]>(mockPedList)

export const getSearchPedInput = () => useAtomValue(pedListSearchAtom) as string
