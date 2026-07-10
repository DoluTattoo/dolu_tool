import { Paper, SimpleGrid, Stack, Text } from '@mantine/core'
import { RiHomeGearFill } from 'react-icons/ri'
import { getInteriorData } from '../../../../atoms/interior'
import { useLocales } from '../../../../providers/LocaleProvider'
import InteriorElement from './components/InteriorElement'
import PortalsElement from './components/PortalsElement'
import RoomsElement from './components/RoomsElement'
import { SectionHeader } from './components/PropertyRow'

const Interior: React.FC = () => {
  const { locale } = useLocales()
  const interior = getInteriorData()

  return (
    <SimpleGrid cols={1}>
      <Stack gap='sm'>
        {
          interior?.interiorId <= 0
            ?
            <Paper p='md'>
              <SectionHeader title={locale.ui_current_interior} icon={<RiHomeGearFill size={22} />} />
              <Text c='dimmed' size='sm' px={8}>{locale.ui_not_in_interior}</Text>
            </Paper>
            :
            <>
              <InteriorElement />
              <RoomsElement />
              <PortalsElement />
            </>
        }
      </Stack>
    </SimpleGrid>
  )
}

export default Interior
