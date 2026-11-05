import { Button, Center, Group, Pagination, SegmentedControl, Stack, Text } from '@mantine/core'
import { useAtom } from 'jotai'
import { getSearchPedInput, PedProp, pedsActivePageAtom, pedsPageContentAtom, pedsPageCountAtom, pedTransformedAtom, pedViewAtom } from '../../../../atoms/ped'
import PedSearch from './components/pedListSearch'
import PedEditorPanel from './components/PedEditorPanel'
import EntityGrid from '../../components/EntityGrid'
import { fetchNui } from '../../../../utils/fetchNui'
import { useNuiEvent } from '../../../../hooks/useNuiEvent'
import { useLocales } from '../../../../providers/LocaleProvider'

const Ped: React.FC = () => {
  const { locale } = useLocales()
  const searchPedValue = getSearchPedInput()
  const [pageContent, setPageContent] = useAtom(pedsPageContentAtom)
  const [pageCount, setPageCount] = useAtom(pedsPageCountAtom)
  const [activePage, setPage] = useAtom(pedsActivePageAtom)
  const [view, setView] = useAtom(pedViewAtom)
  const [transformed, setTransformed] = useAtom(pedTransformedAtom)

  const changePed = (name: string) => {
    fetchNui<boolean>('dolu_tool:changePed', { name }).then(setTransformed)
  }

  useNuiEvent('setPageContent', (data: {type: string, content: PedProp[], maxPages: number}) => {
    if (data.type === 'peds') {
      setPageContent(data.content)
      setPageCount(data.maxPages)
    }
  })

  return(
    <Stack h='100%' gap='md'>
      <Group justify='space-between' wrap='nowrap'>
        <Text fz={20}>{locale.ui_peds}</Text>
        <SegmentedControl
          size='xs'
          color='blue.4'
          value={view}
          onChange={setView}
          data={[
            { value: 'browse', label: locale.ui_ped_browse },
            { value: 'appearance', label: locale.ui_ped_appearance },
            { value: 'animations', label: locale.ui_ped_animations },
          ]}
        />
      </Group>
      {view !== 'browse' ? <PedEditorPanel view={view} /> : (
        <>
          <Group grow>
            <PedSearch/>
            <Button
              disabled={searchPedValue === ''}
              tt='uppercase'
              variant='light'
              color='blue.4'
              onClick={() => changePed(searchPedValue)}
            >
              {locale.ui_set_by_name}
            </Button>
            <Button
              disabled={!transformed}
              tt='uppercase'
              variant='light'
              color='red.4'
              onClick={() => { fetchNui<boolean>('dolu_tool:restorePed').then(setTransformed) }}
            >
              {locale.ui_ped_restore}
            </Button>
          </Group>
          <EntityGrid
            items={pageContent}
            getImageUrl={(name) => `https://gta-images.s3.fr-par.scw.cloud/ped/${name.toLowerCase()}.webp`}
            primaryLabel={locale.ui_set_ped}
            onPrimary={(item) => changePed(item.name)}
            emptyText={locale.ui_no_ped_found}
          />
          <Center>
            <Pagination
              color='blue.4'
              size='sm'
              value={activePage}
              onChange={(value) => {
                fetchNui('dolu_tool:loadPages', { type: 'peds', activePage: value, filter: searchPedValue })
                setPage(value)
              }}
              total={pageCount}
            />
          </Center>
        </>
      )}
    </Stack>
  )

}

export default Ped
