import { atom, useAtomValue } from 'jotai'

export interface WeaponProp {
  hash: number,
  name: string,
}

const mockWeaponList: WeaponProp[] = [
    {
      hash: 2937143193,
      name: "WEAPON_ADVANCEDRIFLE"
    },
    {
      hash: 584646201,
      name: "WEAPON_APPISTOL"
    },
]

export const weaponsListSearchAtom = atom<string>('')
export const weaponsActivePageAtom = atom<number>(1)
export const weaponsPageCountAtom = atom<number>(1)
export const weaponsPageContentAtom = atom<WeaponProp[]>(mockWeaponList)

export const getSearchWeaponInput = () => useAtomValue(weaponsListSearchAtom) as string
