import { ActionIcon, Tooltip } from '@mantine/core'
import type { FloatingPosition } from '@mantine/core'
import { IconBaseProps } from 'react-icons'
import { Link, useLocation } from 'react-router-dom'

interface Props {
  tooltip: string
  to: string
  Icon: React.ComponentType<IconBaseProps>
  color?: string
  hoverColor?: string
  handleClick?: () => void
  toolTipPosition?: FloatingPosition
}

const NavIcon: React.FC<Props> = ({ tooltip, Icon, color, to, handleClick, toolTipPosition }) => {
  const location = useLocation()
  const isActive = location.pathname === to

  return (
    <Tooltip label={tooltip} position={toolTipPosition ? toolTipPosition : 'right'}>
      <ActionIcon
        onClick={() => {
          if (handleClick) return handleClick()
        }}
        size='md'
        component={Link}
        to={to}
        color={color ? color : 'blue.4'}
        className={`dolu-nav-icon${isActive ? '' : ' dolu-nav-icon-inactive'}`}
        variant={isActive ? 'light' : 'transparent'}
      >
        <Icon fontSize={24} />
      </ActionIcon>
    </Tooltip>
  )
}

export default NavIcon
