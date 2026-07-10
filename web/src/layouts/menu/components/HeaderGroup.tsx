import { ActionIcon, Box, Group, Text, Title, Tooltip } from '@mantine/core'
import { useAtom } from 'jotai'
import { TbLogout } from 'react-icons/tb'
import { AiFillGithub } from 'react-icons/ai'
import { FaDiscord } from 'react-icons/fa'
import { SiKofi } from "react-icons/si"
import { menuVisibilityAtom } from '../../../atoms/visibility'
import { Version } from '../../../atoms/version'
import { useNuiEvent } from '../../../hooks/useNuiEvent'
import { fetchNui } from '../../../utils/fetchNui'
import { useLocales } from '../../../providers/LocaleProvider'
import { useExitListener } from '../../../hooks/useExitListener'
import { useEffect, useState } from 'react'
import { openUrl } from '../../../utils/misc'

const HeaderGroup: React.FC<{data: Version}> = ({ data }) => {
  const { locale } = useLocales()
  const [visible, setVisible] = useAtom(menuVisibilityAtom)

  useNuiEvent('setMenuVisible', () => setVisible(true))
  useExitListener(setVisible)

  const [opened, setOpened] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      setOpened(true)
    }, 2000)
  }, [visible])

  return (
    <Box className='dolu-menu-header'>
      <Group h='100%' px={20} justify='space-between' align='center' wrap='nowrap'>
        <Group gap={8} align='baseline' wrap='nowrap'>
          <Title order={3} lh={1}>Dolu Tool</Title>
          <Text
            fz={14}
            fw={600}
            lh={1}
            c={data.url ? 'orange.4' : 'blue.4'}
          >{data.currentVersion}</Text>
        </Group>
        <Group gap={4} wrap='nowrap'>
          {data.url ?

          <Tooltip label={locale.ui_update_warning} position='bottom' transitionProps={{ transition: 'scale-y' }} opened={opened} color='orange.4' style={{ color: 'black', fontWeight: 'bold' }} withArrow arrowSize={10}>
            <ActionIcon
              variant='subtle'
              color='orange.4'
              style={{ width: '40px', height: '40px' }}
              onClick={() => openUrl(data.url!)}
            >
              <AiFillGithub fontSize={24} />
            </ActionIcon>
          </Tooltip>

          :

          <Tooltip label={locale.ui_github} position='bottom' transitionProps={{ transition: 'scale-y' }}>
            <ActionIcon
              variant='subtle'
              color='blue.4'
              style={{ width: '40px', height: '40px' }}
              onClick={() => openUrl('https://github.com/dolutattoo/dolu_tool/')}
            >
              <AiFillGithub fontSize={24} />
            </ActionIcon>
          </Tooltip>

          }

          <Tooltip label={locale.ui_discord} position='bottom' transitionProps={{ transition: 'scale-y' }}>
            <ActionIcon
              variant='subtle'
              color='blue.4'
              style={{ width: '40px', height: '40px' }}
              onClick={() => openUrl('https://discord.gg/ZQn2m2A')}
            >
              <FaDiscord fontSize={24} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label={locale.ui_support} position='bottom' transitionProps={{ transition: 'scale-y' }}>
            <ActionIcon
              variant='subtle'
              color='blue.4'
              style={{ width: '40px', height: '40px' }}
              onClick={() => openUrl('https://ko-fi.com/dolutattoo')}
            >
              <SiKofi fontSize={24} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label={locale.ui_exit} position='bottom' transitionProps={{ transition: 'scale-y' }}>
            <ActionIcon
              variant='subtle'
              color='red.4'
              style={{ width: '40px', height: '40px' }}
              onClick={() => {
                setVisible(false)
                fetchNui('dolu_tool:exit')}
              }
            >
              <TbLogout fontSize={24} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
    </Box>
  )
}

export default HeaderGroup
