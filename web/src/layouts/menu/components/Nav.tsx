import { Box, Stack } from '@mantine/core'
import { AiFillHome } from 'react-icons/ai'
import { BiWorld } from 'react-icons/bi'
import { FaCar, FaMapMarkerAlt, FaTshirt } from 'react-icons/fa'
import { GiPistolGun } from 'react-icons/gi'
import { IoMdCube } from 'react-icons/io'
import { RiHomeGearFill } from 'react-icons/ri'
import { HiSpeakerWave } from 'react-icons/hi2'
import { fetchNui } from '../../../utils/fetchNui'
import { useLocales } from '../../../providers/LocaleProvider'
import NavIcon from './NavIcon'

const Nav: React.FC = () => {
  const { locale } = useLocales()

  return (
    <Box className='dolu-menu-nav'>
      <Stack justify='center' gap={5}>
        <NavIcon color='blue.4' tooltip={locale.ui_home} Icon={AiFillHome} to='/' handleClick={() => fetchNui('dolu_tool:tabSelected', 'home')} />
        <NavIcon color='blue.4' tooltip={locale.ui_world} Icon={BiWorld} to='/world' handleClick={() => fetchNui('dolu_tool:tabSelected', 'world')} />
        <NavIcon color='blue.4' tooltip={locale.ui_interior} Icon={RiHomeGearFill} to='/interior'  handleClick={() => fetchNui('dolu_tool:tabSelected', 'interior')}/>
        <NavIcon color='blue.4' tooltip={locale.ui_object_spawner} Icon={IoMdCube} to='/object'  handleClick={() => fetchNui('dolu_tool:tabSelected', 'object')}/>
        <NavIcon color='blue.4' tooltip={locale.ui_locations} Icon={FaMapMarkerAlt} to='/locations'  handleClick={() => fetchNui('dolu_tool:tabSelected', 'locations')}/>
        <NavIcon color='blue.4' tooltip={locale.ui_peds} Icon={FaTshirt} to='/ped'  handleClick={() => {fetchNui('dolu_tool:tabSelected', 'peds')}}/>
        <NavIcon color='blue.4' tooltip={locale.ui_vehicles} Icon={FaCar} to='/vehicle'  handleClick={() => fetchNui('dolu_tool:tabSelected', 'vehicles')}/>
        <NavIcon color='blue.4' tooltip={locale.ui_weapons} Icon={GiPistolGun} to='/weapon'  handleClick={() => fetchNui('dolu_tool:tabSelected', 'weapons')}/>
        <NavIcon color='blue.4' tooltip={locale.ui_audio} Icon={HiSpeakerWave} to='/audio'  handleClick={() => fetchNui('dolu_tool:tabSelected', 'audio')}/>
      </Stack>
    </Box>
  )
}

export default Nav
