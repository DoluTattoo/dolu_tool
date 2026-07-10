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

export const pedListSearchAtom = atom<string>('')
export const pedsActivePageAtom = atom<number>(1)
export const pedsPageCountAtom = atom<number>(1)
export const pedsPageContentAtom = atom<PedProp[]>(mockPedList)

export const getSearchPedInput = () => useAtomValue(pedListSearchAtom) as string
