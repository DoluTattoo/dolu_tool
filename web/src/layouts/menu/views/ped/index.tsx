import { Button, Center, Group, Pagination, Stack, Text } from '@mantine/core'
import { useAtom } from 'jotai'
import { getSearchPedInput, PedProp, pedsActivePageAtom, pedsPageContentAtom, pedsPageCountAtom } from '../../../../atoms/ped'
import PedSearch from './components/pedListSearch'
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

  useNuiEvent('setPageContent', (data: {type: string, content: PedProp[], maxPages: number}) => {
    if (data.type === 'peds') {
      setPageContent(data.content)
      setPageCount(data.maxPages)
    }
  })

  return(
    <Stack h='100%' gap='md'>
      <Text fz={20}>{locale.ui_peds}</Text>
      <Group grow>
        <PedSearch/>
        <Button
          disabled={searchPedValue === ''}
          tt='uppercase'
          variant='light'
          color='blue.4'
          onClick={() => { fetchNui('dolu_tool:changePed', { name: `${searchPedValue}` }) }}
        >
          {locale.ui_set_by_name}
        </Button>
      </Group>
      <EntityGrid
        items={pageContent}
        getImageUrl={(name) => `https://gta-images.s3.fr-par.scw.cloud/ped/${name.toLowerCase()}.webp`}
        primaryLabel={locale.ui_set_ped}
        onPrimary={(item) => { fetchNui('dolu_tool:changePed', { name: item.name, hash: item.hash }) }}
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
    </Stack>
  )

}

export default Ped
