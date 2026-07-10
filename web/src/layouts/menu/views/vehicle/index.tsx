import { Accordion, Button, Group, Paper, ScrollArea, Stack, Text, Image, Center, Pagination } from '@mantine/core'
import { useEffect, useState} from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { getSearchVehicleInput, vehiclesPageCountAtom, vehiclesActivePageAtom, vehiclesPageContentAtom, VehicleProp } from '../../../../atoms/vehicle'
import { displayImageAtom, imagePathAtom } from '../../../../atoms/imgPreview'
import { setClipboard } from '../../../../utils/setClipboard'
import VehicleSearch from './components/vehicleListSearch'
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

  const [copiedVehicleName, setCopiedVehicleName] = useState(false)
  const [copiedVehicleHash, setCopiedVehicleHash] = useState(false)
  const [currentAccordionItem, setAccordionItem] = useState<string|null>('0')

  const displayImage = useSetAtom(displayImageAtom)
  const imagePath = useSetAtom(imagePathAtom)

  // Copied name button
  useEffect(() => {
    setTimeout(() => {
      if (copiedVehicleName) setCopiedVehicleName(false)
    }, 1000)
  }, [copiedVehicleName, setCopiedVehicleName])
  // Copied hash button
  useEffect(() => {
    setTimeout(() => {
      if (copiedVehicleHash) setCopiedVehicleHash(false)
    }, 1000)
  }, [copiedVehicleHash, setCopiedVehicleHash])

  const VehicleList = pageContent?.map((vehicleList: any, index: number) => (
      <Accordion.Item key={index} value={index.toString()}>
        <Accordion.Control>
          <Text size='md' fw={500}>• {vehicleList.name}</Text>
          <Text size='xs'>{locale.ui_hash}: {vehicleList.hash}</Text>
        </Accordion.Control>
        <Accordion.Panel>
          <Group grow gap='xs'>
            <Image
              onMouseEnter={() => {
                displayImage(true)
                imagePath(`https://gta-images.s3.fr-par.scw.cloud/vehicle/${vehicleList.name.toLowerCase()}.webp`)
              }}
              onMouseLeave={() => {displayImage(false)}}
              h={50}
              fit='contain'
              alt={`${vehicleList.name}`}
              src={`https://gta-images.s3.fr-par.scw.cloud/vehicle/${vehicleList.name.toLowerCase()}.webp`}
              className='dolu-hover-img'
            />
            <Button
              variant='light'
              color={'blue.4'}
              size='xs'
              onClick={() => fetchNui('dolu_tool:spawnVehicle', vehicleList.name)}
            >
              {locale.ui_spawn}
            </Button>
            <Button
              variant='light'
              color={copiedVehicleName ? 'teal' : 'blue.4'}
              size='xs'
              onClick={() => {
                setClipboard(vehicleList.name)
                setCopiedVehicleName(true)
              }}
            >
              {copiedVehicleName ? locale.ui_copied_name : locale.ui_copy_name}
            </Button>
            <Button
              variant='light'
              color={copiedVehicleHash ? 'teal' : 'blue.4'}
              size='xs'
              onClick={() => {
                setClipboard(vehicleList.hash ? `${vehicleList.hash}` : '')
                setCopiedVehicleHash(true)
              }}
            >
              {copiedVehicleHash ? locale.ui_copied_hash : locale.ui_copy_hash}
            </Button>
          </Group>
        </Accordion.Panel>
      </Accordion.Item>
  ))

  return(
    <Stack>
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
      <ScrollArea style={{ height: 575 }} scrollbarSize={0}>
        <Stack>
          <Accordion variant='contained' radius='sm' value={currentAccordionItem} onChange={setAccordionItem}>
            {VehicleList ? VehicleList :
              <Paper p='md'>
                <Text size='md' fw={600} c='red.4'>No vehicle found</Text>
              </Paper>
            }
            </Accordion>
        </Stack>
      </ScrollArea>
      <Center>
        <Pagination
          color='blue.4'
          size='sm'
          value={activePage}
          onChange={(value) => {
            fetchNui('dolu_tool:loadPages', { type: 'vehicles', activePage: value, filter: searchVehicleValue })
            setPage(value)
            setAccordionItem('0')
          }}
          total={pageCount}
        />
      </Center>
    </Stack>
  )

}

export default Vehicle
