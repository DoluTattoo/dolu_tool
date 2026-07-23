import { Button, Center, Group, Pagination, Stack, Text } from '@mantine/core'
import { useAtom } from 'jotai'
import { getSearchVehicleInput, vehiclesPageCountAtom, vehiclesActivePageAtom, vehiclesPageContentAtom, VehicleProp } from '../../../../atoms/vehicle'
import VehicleSearch from './components/vehicleListSearch'
import EntityGrid from '../../components/EntityGrid'
import { fetchNui } from '../../../../utils/fetchNui'
import { useNuiEvent } from '../../../../hooks/useNuiEvent'
import { useLocales } from '../../../../providers/LocaleProvider'

const Vehicle: React.FC = () => {
  const { locale } = useLocales()
  const searchVehicleValue = getSearchVehicleInput()
  const [pageContent, setPageContent] = useAtom(vehiclesPageContentAtom)
  const [pageCount, setPageCount] = useAtom(vehiclesPageCountAtom)
  const [activePage, setPage] = useAtom(vehiclesActivePageAtom)

  useNuiEvent('setPageContent', (data: {type: string, content: VehicleProp[], maxPages: number}) => {
    if (data.type === 'vehicles') {
      setPageContent(data.content)
      setPageCount(data.maxPages)
    }
  })

  return(
    <Stack h='100%' gap='md'>
      <Text fz={20}>{locale.ui_vehicles}</Text>
      <Group grow>
        <VehicleSearch/>
        <Button
          disabled={searchVehicleValue === ''}
          tt='uppercase'
          variant='light'
          color='blue.4'
          onClick={() => fetchNui('dolu_tool:spawnVehicle', searchVehicleValue)}
        >
          {locale.ui_spawn_by_name}
        </Button>
      </Group>
      <EntityGrid
        items={pageContent}
        getImageUrl={(name) => `https://gta-images.s3.fr-par.scw.cloud/vehicle/${name.toLowerCase()}.webp`}
        primaryLabel={locale.ui_spawn}
        onPrimary={(item) => fetchNui('dolu_tool:spawnVehicle', item.name)}
        emptyText={locale.ui_no_vehicle_found}
      />
      <Center>
        <Pagination
          color='blue.4'
          size='sm'
          value={activePage}
          onChange={(value) => {
            fetchNui('dolu_tool:loadPages', { type: 'vehicles', activePage: value, filter: searchVehicleValue })
            setPage(value)
          }}
          total={pageCount}
        />
      </Center>
    </Stack>
  )

}

export default Vehicle
