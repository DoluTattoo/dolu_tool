import { atom } from 'jotai'

export interface Version {
    currentVersion: string
    url?: string
}

export const versionAtom = atom<Version>({ currentVersion: "" })
