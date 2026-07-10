import { TextInput } from '@mantine/core'
import { useDebouncedValue } from '@mantine/hooks'
import { TbSearch } from 'react-icons/tb'
import { useAtom, useSetAtom } from 'jotai'
import { pedListSearchAtom, pedsActivePageAtom } from '../../../../../atoms/ped'
import { useEffect } from 'react'
import { useLocales } from '../../../../../providers/LocaleProvider'
import { fetchNui } from '../../../../../utils/fetchNui'

const PedSearch: React.FC = () => {
  const { locale } = useLocales()
  const [searchPed, setSearchPed] = useAtom(pedListSearchAtom)
  const [debouncedPedSearch] = useDebouncedValue(searchPed, 200)
  const setActivePage = useSetAtom(pedsActivePageAtom)

  useEffect(() => {
    setActivePage(1)
    fetchNui('dolu_tool:loadPages', { type: 'peds', activePage: 1, filter: debouncedPedSearch })
  }, [debouncedPedSearch])

  return (
    <>
      <TextInput
        placeholder={locale.ui_search}
        leftSection={<TbSearch size={20} />}
        value={searchPed}
        onChange={(e) => setSearchPed(e.target.value)}
      />
    </>
  )
}

export default PedSearch
