import { TextInput } from '@mantine/core'
import { useDebouncedValue } from '@mantine/hooks'
import { TbSearch } from 'react-icons/tb'
import { useAtom, useSetAtom } from 'jotai'
import { weaponsActivePageAtom, weaponsListSearchAtom } from '../../../../../atoms/weapon'
import { useEffect } from 'react'
import { useLocales } from '../../../../../providers/LocaleProvider'
import { fetchNui } from '../../../../../utils/fetchNui'

const WeaponSearch: React.FC = () => {
  const { locale } = useLocales()
  const [searchWeapon, setSearchWeapon] = useAtom(weaponsListSearchAtom)
  const [debouncedWeaponSearch] = useDebouncedValue(searchWeapon, 200)
  const setActivePage = useSetAtom(weaponsActivePageAtom)

  useEffect(() => {
    setActivePage(1)
    fetchNui('dolu_tool:loadPages', { type: 'weapons', activePage: 1, filter: debouncedWeaponSearch })
  }, [debouncedWeaponSearch])

  return (
    <>
      <TextInput
        placeholder={locale.ui_search}
        leftSection={<TbSearch size={20} />}
        value={searchWeapon}
        onChange={(e) => setSearchWeapon(e.target.value)}
      />
    </>
  )
}

export default WeaponSearch
