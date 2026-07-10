import { Accordion, Button, Group, Paper, ScrollArea, Stack, Text, Image, Center, Pagination } from '@mantine/core'
import { useEffect, useState} from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { getSearchWeaponInput, weaponsPageCountAtom, weaponsActivePageAtom, weaponsPageContentAtom, WeaponProp } from '../../../../atoms/weapon'
import { displayImageAtom, imagePathAtom } from '../../../../atoms/imgPreview'
import { setClipboard } from '../../../../utils/setClipboard'
import WeaponSearch from './components/weaponListSearch'
import { fetchNui } from '../../../../utils/fetchNui'
import { useNuiEvent } from '../../../../hooks/useNuiEvent'
import { useLocales } from '../../../../providers/LocaleProvider'

const Weapon: React.FC = () => {
  const { locale } = useLocales()
  const searchWeaponValue = getSearchWeaponInput()
  const [pageContent, setPageContent] = useAtom(weaponsPageContentAtom)
  const [pageCount, setPageCount] = useAtom(weaponsPageCountAtom)
  const [activePage, setPage] = useAtom(weaponsActivePageAtom)

  useNuiEvent('setPageContent', (data: {type: string, content: WeaponProp[], maxPages: number}) => {
    if (data.type === 'weapons') {
      setPageContent(data.content)
      setPageCount(data.maxPages)
    }
  })

  const [copiedWeaponName, setCopiedWeaponName] = useState(false)
  const [copiedWeaponHash, setCopiedWeaponHash] = useState(false)
  const [currentAccordionItem, setAccordionItem] = useState<string|null>('0')

  const displayImage = useSetAtom(displayImageAtom)
  const imagePath = useSetAtom(imagePathAtom)

  // Copied name button
  useEffect(() => {
    setTimeout(() => {
      if (copiedWeaponName) setCopiedWeaponName(false)
    }, 1000)
  }, [copiedWeaponName, setCopiedWeaponName])
  // Copied hash button
  useEffect(() => {
    setTimeout(() => {
      if (copiedWeaponHash) setCopiedWeaponHash(false)
    }, 1000)
  }, [copiedWeaponHash, setCopiedWeaponHash])

  const WeaponList = pageContent?.map((weaponList: any, index: number) => (
      <Accordion.Item key={index} value={index.toString()}>
        <Accordion.Control>
          <Text size='md' fw={500}>• {weaponList.name}</Text>
          <Text size='xs'>{locale.ui_hash}: {weaponList.hash}</Text>
        </Accordion.Control>
        <Accordion.Panel>
          <Group grow gap='xs'>
            <Image
              onMouseEnter={() => {
                displayImage(true)
                imagePath(`https://gta-images.s3.fr-par.scw.cloud/weapon/${weaponList.name.toUpperCase()}.png`)
              }}
              onMouseLeave={() => {displayImage(false)}}
              h={50}
              fit='contain'
              alt={`${weaponList.name}`}
              src={`https://gta-images.s3.fr-par.scw.cloud/weapon/${weaponList.name.toUpperCase()}.png`}
              className='dolu-hover-img'
            />
            <Button
              variant='light'
              color={'blue.4'}
              size='xs'
              onClick={() => fetchNui('dolu_tool:giveWeapon', weaponList.name)}
            >
              {locale.ui_give_weapon}
            </Button>
            <Button
              variant='light'
              color={copiedWeaponName ? 'teal' : 'blue.4'}
              size='xs'
              onClick={() => {
                setClipboard(weaponList.name)
                setCopiedWeaponName(true)
              }}
            >
              {copiedWeaponName ? locale.ui_copied_name : locale.ui_copy_name}
            </Button>
            <Button
              variant='light'
              color={copiedWeaponHash ? 'teal' : 'blue.4'}
              size='xs'
              onClick={() => {
                setClipboard(weaponList.hash ? `${weaponList.hash}` : '')
                setCopiedWeaponHash(true)
              }}
            >
              {copiedWeaponHash ? locale.ui_copied_hash : locale.ui_copy_hash}
            </Button>
          </Group>
        </Accordion.Panel>
      </Accordion.Item>
  ))

  return(
    <Stack>
      <Text fz={20}>{locale.ui_weapons}</Text>
      <Group grow>
        <WeaponSearch/>
        <Button
          disabled={searchWeaponValue === ''}
          tt='uppercase'
          variant='light'
          color='blue.4'
          onClick={() => fetchNui('dolu_tool:giveWeapon', searchWeaponValue)}
        >
          {locale.ui_give_weapon_by_name}
        </Button>
      </Group>

      <ScrollArea style={{ height: 575 }} scrollbarSize={0}>
        <Stack>
          <Accordion variant='contained' radius='sm' value={currentAccordionItem} onChange={setAccordionItem}>
            {WeaponList ? WeaponList :
              <Paper p='md'>
                <Text size='md' fw={600} c='red.4'>{locale.ui_no_weapon_found}</Text>
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
            fetchNui('dolu_tool:loadPages', { type: 'weapons', activePage: value, filter: searchWeaponValue })
            setPage(value)
            setAccordionItem('0')
          }}
          total={pageCount}
        />
      </Center>
    </Stack>
  )

}

export default Weapon
