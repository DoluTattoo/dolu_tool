import { Button, Center, Group, Pagination, Stack, Text } from '@mantine/core'
import { useAtom } from 'jotai'
import { getSearchWeaponInput, weaponsPageCountAtom, weaponsActivePageAtom, weaponsPageContentAtom, WeaponProp } from '../../../../atoms/weapon'
import WeaponSearch from './components/weaponListSearch'
import EntityGrid from '../../components/EntityGrid'
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

  return(
    <Stack h='100%' gap='md'>
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
      <EntityGrid
        items={pageContent}
        getImageUrl={(name) => `https://gta-images.s3.fr-par.scw.cloud/weapon/${name.toUpperCase()}.png`}
        primaryLabel={locale.ui_give_weapon}
        onPrimary={(item) => fetchNui('dolu_tool:giveWeapon', item.name)}
        emptyText={locale.ui_no_weapon_found}
      />
      <Center>
        <Pagination
          color='blue.4'
          size='sm'
          value={activePage}
          onChange={(value) => {
            fetchNui('dolu_tool:loadPages', { type: 'weapons', activePage: value, filter: searchWeaponValue })
            setPage(value)
          }}
          total={pageCount}
        />
      </Center>
    </Stack>
  )

}

export default Weapon
