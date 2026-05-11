import { atom, useRecoilValue } from 'recoil'
import { z } from 'zod'

export const clockDataSchema = z.object({
    hour: z.number(),
    minute: z.number(),
})

export const worldDataSchema = z.object({
    weather: z.string(),
    clock: clockDataSchema,
})

export const worldHourAtom = atom<number>({ key: 'worldHour', default: 0 })
export const worldMinuteAtom = atom<number>({ key: 'worldMinute', default: 0 })
export const worldWeatherAtom = atom<string>({ key: 'worldWeather', default: 'Neutral' })

export const worldFreezeTimeAtom = atom<boolean>({ key: 'worldFreezeTime', default: false })
export const worldFreezeWeatherAtom = atom<boolean>({ key: 'worldFreezeWeather', default: false })


export const getWorldHour = () => useRecoilValue(worldHourAtom)
export const getWorldMinute = () => useRecoilValue(worldMinuteAtom)
export const getWorldWeather = () => useRecoilValue(worldWeatherAtom)

export const getWorldFreezeTime = () => useRecoilValue(worldFreezeTimeAtom)
export const getWorldFreezeWeather = () => useRecoilValue(worldFreezeWeatherAtom)
