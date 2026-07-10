import { Accordion, Button, Group, Paper, ScrollArea, Stack, Text, Image, Center, Pagination } from '@mantine/core'
import { useEffect, useState} from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { getSearchPedInput, PedProp, pedsActivePageAtom, pedsPageContentAtom, pedsPageCountAtom } from '../../../../atoms/ped'
import { displayImageAtom, imagePathAtom } from '../../../../atoms/imgPreview'
import { setClipboard } from '../../../../utils/setClipboard'
import PedSearch from './components/pedListSearch'
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

  const [copiedPedName, setCopiedPedName] = useState(false)
  const [copiedPedHash, setCopiedPedHash] = useState(false)
  const [currentAccordionItem, setAccordionItem] = useState<string|null>('0')

  const displayImage = useSetAtom(displayImageAtom)
  const imagePath = useSetAtom(imagePathAtom)

  // Copied name button
  useEffect(() => {
    setTimeout(() => {
      if (copiedPedName) setCopiedPedName(false)
    }, 1000)
  }, [copiedPedName, setCopiedPedName])
  // Copied hash button
  useEffect(() => {
    setTimeout(() => {
      if (copiedPedHash) setCopiedPedHash(false)
    }, 1000)
  }, [copiedPedHash, setCopiedPedHash])

  const PedList = pageContent?.map((pedList: any, index: number) => (
      <Accordion.Item key={index} value={index.toString()}>
        <Accordion.Control>
          <Text size='md' fw={500}>• {pedList.name}</Text>
          <Text size='xs'>{locale.ui_hash}: {pedList.hash}</Text>
        </Accordion.Control>
        <Accordion.Panel>
          <Group grow gap='xs'>
            <Image
              onMouseEnter={() => {
                displayImage(true)
                imagePath(`https://gta-images.s3.fr-par.scw.cloud/ped/${pedList.name.toLowerCase()}.webp`)
              }}
              onMouseLeave={() => {displayImage(false)}}
              h={50}
              fit='contain'
              alt={`${pedList.name}`}
              src={`https://gta-images.s3.fr-par.scw.cloud/ped/${pedList.name.toLowerCase()}.webp`}
              className='dolu-hover-img'
            />
            <Button
              variant='light'
              color={'blue.4'}
              size='xs'
              onClick={() => { fetchNui('dolu_tool:changePed', { name: pedList.name, hash: pedList.hash }) }}
            >
              {locale.ui_set_ped}
            </Button>
            <Button
              variant='light'
              color={copiedPedName ? 'teal' : 'blue.4'}
              size='xs'
              onClick={() => {
                setClipboard(pedList.name)
                setCopiedPedName(true)
              }}
            >
              {copiedPedName ? locale.ui_copied_name : locale.ui_copy_name}
            </Button>
            <Button
              variant='light'
              color={copiedPedHash ? 'teal' : 'blue.4'}
              size='xs'
              onClick={() => {
                setClipboard(pedList.hash ? `${pedList.hash}` : '')
                setCopiedPedHash(true)
              }}
            >
              {copiedPedHash ? locale.ui_copied_hash : locale.ui_copy_hash}
            </Button>
          </Group>
        </Accordion.Panel>
      </Accordion.Item>
  ))

  return(
    <Stack>
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
      <ScrollArea style={{ height: 575 }} scrollbarSize={0}>
        <Stack>
          <Accordion variant='contained' radius='sm' value={currentAccordionItem} onChange={setAccordionItem}>
            {PedList ? PedList :
              <Paper p='md'>
                <Text size='md' fw={600} c='red.4'>{locale.ui_no_ped_found}</Text>
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
            fetchNui('dolu_tool:loadPages', { type: 'peds', activePage: value, filter: searchPedValue })
            setPage(value)
            setAccordionItem('0')
          }}
          total={pageCount}
        />
      </Center>
    </Stack>
  )

}

export default Ped
