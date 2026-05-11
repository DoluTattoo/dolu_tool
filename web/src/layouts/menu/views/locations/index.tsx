import { Accordion, Badge, Button, Center, Checkbox, Group, Pagination, Paper, ScrollArea, Stack, Text } from '@mantine/core'
import { openModal } from '@mantine/modals'
import CreateLocation from './components/modals/CreateLocation'
import { getSearchLocationInput, locationsActivePageAtom, locationCustomFilterAtom, locationsPageCountAtom, locationPageContentSchema, locationVanillaFilterAtom, locationsPageContentAtom } from '../../../../atoms/location'
import LocationSearch from './components/LocationSearch'
import { setClipboard } from '../../../../utils/setClipboard'
import { useEffect, useState } from 'react'
import RenameLocation from './components/modals/RenameLocation'
import { useRecoilState } from 'recoil'
import { fetchNui } from '../../../../utils/fetchNui'
import { useNuiValidatedEvent } from '../../../../hooks/useNuiValidatedEvent'
import DeleteLocation from './components/modals/DeleteLocation'
import { useLocales } from '../../../../providers/LocaleProvider'

const Locations: React.FC = () => {
  const { locale } = useLocales()
  const searchLocationValue = getSearchLocationInput()
  const [pageContent, setPageContent] = useRecoilState(locationsPageContentAtom)
  const [pageCount, setPageCount] = useRecoilState(locationsPageCountAtom)
  const [activePage, setPage] = useRecoilState(locationsActivePageAtom)

  useNuiValidatedEvent('setPageContent', locationPageContentSchema, (data) => {
    if (data.type === 'locations') {
      setPageContent(data.content)
      setPageCount(data.maxPages)
    }
  })

  // Checkboxes
  const [checkedVanilla, setCheckedVanilla] = useRecoilState(locationVanillaFilterAtom)
  const [checkedCustom, setCheckedCustom] = useRecoilState(locationCustomFilterAtom)

  // Accordion
  const [currentAccordionItem, setAccordionItem] = useState<string|null>('0')

  // Copied button
  const [copied, setCopied] = useState(false)
  useEffect(() => {
    setTimeout(() => {
      if (copied) setCopied(false)
    }, 2000)
  }, [copied, setCopied])

  const Locationlist = pageContent?.map((location: any, index: number) => (
      <Accordion.Item key={index} value={index.toString()}>
        <Accordion.Control>
          <Stack spacing={0}>
            <Group position='apart'>
              <Text color='blue.4' size='md' weight={500}>{location.name}</Text>
              <Badge color={location.custom ? 'green.4' : 'blue.4'}>{location.custom ? locale.ui_custom : locale.ui_vanilla}</Badge>
            </Group>
            <Text size='xs'>{locale.ui_coords}: {location.x}, {location.y}, {location.z}</Text>
          </Stack>
        </Accordion.Control>
        <Accordion.Panel>
          <Group grow spacing='xs'>
            <Button
              variant='light'
              color='blue.4'
              size='xs'
              onClick={() =>
                fetchNui('dolu_tool:teleport', { name: location.name, x: location.x, y: location.y, z: location.z, heading: location.heading })
              }
            >
              {locale.ui_teleport}
            </Button>
            <Button
              variant='light'
              color={copied ? 'teal' : 'blue.4'}
              size='xs'
              onClick={() => {
                setClipboard(location.x + ', ' + location.y + ', ' + location.z)
                setCopied(true)
              }}
            >
              {copied ? locale.ui_copied_coords : locale.ui_copy_coords}
            </Button>
            {location.custom &&
              <Button
                variant='light'
                color='blue.4'
                size='xs'
                onClick={() => {
                  openModal({
                    title: locale.ui_rename,
                    children: <RenameLocation defaultName={location.name} />,
                    size: 'xs',
                  })
                }}
              >
                {locale.ui_rename}
              </Button>
            }
            {location.custom &&
              <Button
                variant='light'
                color='blue.4'
                size='xs'
                onClick={() => {
                  openModal({
                    title: locale.ui_delete,
                    children: <DeleteLocation name={location.name} />,
                    size: 'xs',
                  })
                  setAccordionItem(null)
                }}
              >{locale.ui_delete}</Button>
            }
          </Group>
        </Accordion.Panel>
      </Accordion.Item>
  ))

  return (
    <>
      <Stack>
        <Text size={20}>{locale.ui_locations}</Text>
        <Group grow>            
          <Checkbox
            label={locale.ui_show_custom_locations}
            size='sm'
            color='blue.4'
            disabled={!checkedVanilla}
            checked={checkedCustom}
            onChange={(e) => {
              fetchNui('dolu_tool:loadPages', { type: 'locations', activePage: 1, filter: searchLocationValue, checkboxes: {vanilla: checkedVanilla, custom: e.currentTarget.checked} })
              setPage(1)
              setCheckedCustom(e.currentTarget.checked)
            }}
          />
          <Checkbox
            label={locale.ui_show_vanilla_locations}
            size='sm'
            color='blue.4'
            disabled={!checkedCustom}
            checked={checkedVanilla}
            onChange={(e) => {
              fetchNui('dolu_tool:loadPages', { type: 'locations', activePage: 1, filter: searchLocationValue, checkboxes: {vanilla: e.currentTarget.checked, custom: checkedCustom} })
              setPage(1)
              setCheckedVanilla(e.currentTarget.checked)
            }}
          />
        </Group>
        
        <Button
          uppercase
          variant='light'
          color='blue.4'
          onClick={() =>
            openModal({
              title: locale.ui_create_custom_location,
              size: 'xs',
              children: <CreateLocation />,
            })
          }
        >{locale.ui_create_custom_location}</Button>
        
        <LocationSearch />

        <ScrollArea style={{ height: 480 }} scrollbarSize={0}>
          <Stack>
            <Accordion chevronPosition='left' variant='contained' radius='sm' value={currentAccordionItem} onChange={setAccordionItem}>
              {Locationlist ? Locationlist :
                <Paper p='md'>
                  <Text size='md' weight={600} color='red.4'>{locale.ui_no_location_found}</Text>
                </Paper>
              }
            </Accordion>
          </Stack>
        </ScrollArea>
        <Center>
          <Pagination
            color='blue.4'
            size='sm'
            page={activePage}
            onChange={(value) => {
              fetchNui('dolu_tool:loadPages', { type: 'locations', activePage: value, filter: searchLocationValue, checkboxes: {vanilla: checkedVanilla, custom: checkedCustom} })
              setPage(value)
              setAccordionItem('0')
            }}
            total={pageCount}
          />
        </Center>
      </Stack>
    </>
  )
}

export default Locations
