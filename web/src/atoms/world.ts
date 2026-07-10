import { atom, useAtomValue } from 'jotai'

export const worldHourAtom = atom<number>(0)
export const worldMinuteAtom = atom<number>(0)
export const worldWeatherAtom = atom<string>('Neutral')

export const worldFreezeTimeAtom = atom<boolean>(false)
export const worldFreezeWeatherAtom = atom<boolean>(false)


export const getWorldHour = () => useAtomValue(worldHourAtom)
export const getWorldMinute = () => useAtomValue(worldMinuteAtom)
export const getWorldWeather = () => useAtomValue(worldWeatherAtom)

export const getWorldFreezeTime = () => useAtomValue(worldFreezeTimeAtom)
export const getWorldFreezeWeather = () => useAtomValue(worldFreezeWeatherAtom)
