import { useEffect } from 'react'
import { TextInput } from '@mantine/core'
import { useDebouncedValue } from '@mantine/hooks'
import { useAtom, useSetAtom } from 'jotai'
import { TbSearch } from 'react-icons/tb'
import { vehicleListSearchAtom, vehiclesActivePageAtom } from '../../../../../atoms/vehicle'
import { fetchNui } from '../../../../../utils/fetchNui'
import { useLocales } from '../../../../../providers/LocaleProvider'

const VehicleSearch: React.FC = () => {
  const { locale } = useLocales()
  const [searchVehicle, setSearchVehicle] = useAtom(vehicleListSearchAtom)
  const [debouncedVehicleSearch] = useDebouncedValue(searchVehicle, 200)
  const setActivePage = useSetAtom(vehiclesActivePageAtom)

  useEffect(() => {
    setActivePage(1)
    fetchNui('dolu_tool:loadPages', { type: 'vehicles', activePage: 1, filter: debouncedVehicleSearch })
  }, [debouncedVehicleSearch])

  return (
    <>
      <TextInput
        placeholder={locale.ui_search}
        leftSection={<TbSearch size={20} />}
        value={searchVehicle}
        onChange={(e) => setSearchVehicle(e.target.value)}
      />
    </>
  )
}

export default VehicleSearch
