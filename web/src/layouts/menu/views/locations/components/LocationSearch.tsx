import { TextInput } from '@mantine/core'
import { useDebouncedValue } from '@mantine/hooks'
import { TbSearch } from 'react-icons/tb'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { locationCustomFilterAtom, locationsActivePageAtom, locationSearchAtom, locationVanillaFilterAtom } from '../../../../../atoms/location'
import { useEffect } from 'react'
import { useLocales } from '../../../../../providers/LocaleProvider'
import { fetchNui } from '../../../../../utils/fetchNui'

const LocationSearch: React.FC = () => {
  const { locale } = useLocales()
  const [search, setSearch] = useAtom(locationSearchAtom)
  const [debouncedSearch] = useDebouncedValue(search, 100)
  const setActivePage = useSetAtom(locationsActivePageAtom)
  const checkedVanilla = useAtomValue(locationVanillaFilterAtom)
  const checkedCustom = useAtomValue(locationCustomFilterAtom)

  useEffect(() => {
    setActivePage(1)
    fetchNui('dolu_tool:loadPages', { type: 'locations', activePage: 1, filter: debouncedSearch, checkboxes: { vanilla: checkedVanilla, custom: checkedCustom } })
  }, [debouncedSearch])

  return (
    <>
      <TextInput
        placeholder={locale.ui_search}
        leftSection={<TbSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </>
  )
}

export default LocationSearch
