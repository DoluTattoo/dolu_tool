import { atom, useAtomValue } from 'jotai'

export interface VehicleProp {
  hash: number,
  name: string,
  class: string,
  displayName: string,
  type: string,
  dlc: string,
  manufacturer: string,
}

const mockVehicleList: VehicleProp[] = [
    {
      hash: -1216765807,
      name: "adder",
      class: "SUPER",
      displayName: "Adder",
      type: "CAR",
      dlc: "TitleUpdate",
      manufacturer: "Truffade"
    },
    {
      hash: -214906006,
      name: "jester3",
      class: "SPORT",
      displayName: "Jester Classic",
      type: "CAR",
      dlc: "mpassault",
      manufacturer: "Dinka"
    },
]

export const vehicleListSearchAtom = atom<string>('')
export const vehiclesActivePageAtom = atom<number>(1)
export const vehiclesPageCountAtom = atom<number>(1)
export const vehiclesPageContentAtom = atom<VehicleProp[]>(mockVehicleList)

export const getSearchVehicleInput = () => useAtomValue(vehicleListSearchAtom) as string
