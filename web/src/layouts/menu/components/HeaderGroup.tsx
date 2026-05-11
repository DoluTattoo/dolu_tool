import { ActionIcon, Group, Header, Text, Title, Tooltip } from '@mantine/core'
import { useRecoilState } from 'recoil'
import { TbLogout } from 'react-icons/tb'
import { AiFillGithub } from 'react-icons/ai'
import { FaDiscord } from 'react-icons/fa'
import { SiKofi } from "react-icons/si"
import { emptyEventSchema, menuVisibilityAtom } from '../../../atoms/visibility'
import { Version } from '../../../atoms/version'
import { useNuiValidatedEvent } from '../../../hooks/useNuiValidatedEvent'
import { fetchNui } from '../../../utils/fetchNui'
import { useLocales } from '../../../providers/LocaleProvider'
import { useExitListener } from '../../../hooks/useExitListener'
import { useEffect, useState } from 'react'
import { openUrl } from '../../../utils/misc'

const HeaderGroup: React.FC<{data: Version}> = ({ data }) => {
  const { locale } = useLocales()
  const [visible, setVisible] = useRecoilState(menuVisibilityAtom)

  useNuiValidatedEvent('setMenuVisible', emptyEventSchema, () => setVisible(true))
  useExitListener(setVisible)

  const [opened, setOpened] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      setOpened(true)
    }, 2000)
  }, [visible])

  return (
    <Header sx={{ height: '50px', borderTopLeftRadius: '10px', borderTopRightRadius: '10px' }} height={50}>
      <Group px={20} position='apart'>
        <Group>
          <Title order={3}>Dolu Tool</Title>
          <Text
            size={14}
            weight={600}
            color={data.url ? 'orange.4' : 'blue.4'}
            style={{ position: 'absolute', top: '18px', left: '129px' }}
          >{data.currentVersion}</Text>
        </Group>
        <Group>
          {data.url ?

          <Tooltip label={locale.ui_update_warning} position='bottom' transition='scale-y' opened={opened} color='orange.4' style={{ color: 'black', fontWeight: 'bold' }} withArrow arrowSize={10}>
            <ActionIcon
              color='orange.4'
              style={{ margin: '5px', width: '40px', height: '40px' }}
              onClick={() => openUrl(data.url!)}
            >
              <AiFillGithub fontSize={24} />
            </ActionIcon>
          </Tooltip>

          :

          <Tooltip label={locale.ui_github} position='bottom' transition='scale-y'>
            <ActionIcon
              color='blue.4'
              style={{ margin: '5px', width: '40px', height: '40px' }}
              onClick={() => openUrl('https://github.com/dolutattoo/dolu_tool/')}
            >
              <AiFillGithub fontSize={24} />
            </ActionIcon>
          </Tooltip>

          }

          <Tooltip label={locale.ui_discord} position='bottom' transition='scale-y'>
            <ActionIcon
              color='blue.4'
              style={{ margin: '5px', width: '40px', height: '40px' }}
              onClick={() => openUrl('https://discord.gg/ZQn2m2A')}
            >
              <FaDiscord fontSize={24} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label={locale.ui_support} position='bottom' transition='scale-y'>
            <ActionIcon
              color='blue.4'
              style={{ margin: '5px', width: '40px', height: '40px' }}
              onClick={() => openUrl('https://ko-fi.com/dolutattoo')}
            >
              <SiKofi fontSize={24} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label={locale.ui_exit} position='bottom' transition='scale-y'>
            <ActionIcon
              color='red.4'
              style={{ margin: '5px', width: '40px', height: '40px' }}
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
    </Header>
  )
}

export default HeaderGroup
