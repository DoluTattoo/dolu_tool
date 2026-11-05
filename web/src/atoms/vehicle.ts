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

export type RgbColour = [number, number, number]

export interface VehicleMod {
  id: number,
  current: number,
  customTyres: boolean,
  slotLabel: string | false,
  labels: (string | false)[],
}

export interface VehicleColours {
  primary: number,
  secondary: number,
  pearlescent: number,
  wheel: number,
  interior: number,
  dashboard: number,
}

export interface VehicleCustomization {
  model: string,
  isBike: boolean,
  mods: VehicleMod[],
  turbo: boolean,
  tyreSmoke: boolean,
  tyreSmokeColour: RgbColour,
  wheelType: number,
  colours: VehicleColours,
  customPrimary: RgbColour | false,
  customSecondary: RgbColour | false,
  livery: { current: number, labels: (string | false)[] } | false,
  roofLivery: { current: number, count: number } | false,
  xenon: boolean,
  xenonColour: number,
  neons: boolean[],
  neonColour: RgbColour,
  windowTint: number,
  plate: string,
  plateIndex: number,
  extras: { id: number, enabled: boolean }[],
}

export const vehicleViewAtom = atom<string>('browse')
export const vehicleCustomizationAtom = atom<VehicleCustomization | false>(false)

export const vehicleListSearchAtom = atom<string>('')
export const vehiclesActivePageAtom = atom<number>(1)
export const vehiclesPageCountAtom = atom<number>(1)
export const vehiclesPageContentAtom = atom<VehicleProp[]>(mockVehicleList)

export const getSearchVehicleInput = () => useAtomValue(vehicleListSearchAtom) as string
