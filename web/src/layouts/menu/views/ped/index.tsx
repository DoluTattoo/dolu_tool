import { Accordion, Button, Group, Paper, ScrollArea, Stack, Text, Image, Center, Pagination } from '@mantine/core'
import { useEffect, useState} from 'react'
import { useRecoilState, useSetRecoilState } from 'recoil'
import { getSearchPedInput, pedPageContentSchema, pedsActivePageAtom, pedsPageContentAtom, pedsPageCountAtom } from '../../../../atoms/ped'
import { displayImageAtom, imagePathAtom } from '../../../../atoms/imgPreview'
import { setClipboard } from '../../../../utils/setClipboard'
import PedSearch from './components/pedListSearch'
import { fetchNui } from '../../../../utils/fetchNui'
import { useNuiValidatedEvent } from '../../../../hooks/useNuiValidatedEvent'
import { useLocales } from '../../../../providers/LocaleProvider'

const Ped: React.FC = () => {
  const { locale } = useLocales()
  const searchPedValue = getSearchPedInput()
  const [pageContent, setPageContent] = useRecoilState(pedsPageContentAtom)
  const [pageCount, setPageCount] = useRecoilState(pedsPageCountAtom)
  const [activePage, setPage] = useRecoilState(pedsActivePageAtom)

  useNuiValidatedEvent('setPageContent', pedPageContentSchema, (data) => {
    if (data.type === 'peds') {
      setPageContent(data.content)
      setPageCount(data.maxPages)
    }
  })

  const [copiedPedName, setCopiedPedName] = useState(false)
  const [copiedPedHash, setCopiedPedHash] = useState(false)
  const [currentAccordionItem, setAccordionItem] = useState<string|null>('0')

  const displayImage = useSetRecoilState(displayImageAtom)
  const imagePath = useSetRecoilState(imagePathAtom)

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
          <Text size='md' weight={500}>• {pedList.name}</Text>
          <Text size='xs'>{locale.ui_hash}: {pedList.hash}</Text>
        </Accordion.Control>
        <Accordion.Panel>
          <Group grow spacing='xs'> 
            <Image
              onMouseEnter={() => {
                displayImage(true)
                imagePath(`https://gta-images.s3.fr-par.scw.cloud/ped/${pedList.name.toLowerCase()}.webp`)
              }}
              onMouseLeave={() => {displayImage(false)}}
              height={50}
              fit='contain'
              alt={`${pedList.name}`}
              src={`https://gta-images.s3.fr-par.scw.cloud/ped/${pedList.name.toLowerCase()}.webp`}
              withPlaceholder={true}
              sx={{
                '&:hover':{
                  borderRadius: '5px',
                  backgroundColor: 'rgba(35, 35, 35, 0.75)'
                }
              }}
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
      <Text size={20}>{locale.ui_peds}</Text>
      <Group grow>
        <PedSearch/>
        <Button
          disabled={searchPedValue === ''}
          uppercase
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
                <Text size='md' weight={600} color='red.4'>{locale.ui_no_ped_found}</Text>
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
