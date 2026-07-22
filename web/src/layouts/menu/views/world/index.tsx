import { Text, Stack, SimpleGrid, Paper, Group, Slider, ActionIcon, Button, Space, Checkbox, Tooltip } from '@mantine/core'
import { TbHelpCircle, TbMinus, TbPlus } from 'react-icons/tb'
import { fetchNui } from '../../../../utils/fetchNui'
import { useAtom } from 'jotai'
import { worldCloudsOpacityAtom, worldFreezeTimeAtom, worldFreezeWeatherAtom, worldHourAtom, worldMinuteAtom, worldWeatherAtom } from '../../../../atoms/world'
import { useLocales } from '../../../../providers/LocaleProvider'

const WEATHER_TYPES = [
  { value: 'clear', label: 'Clear' },
  { value: 'extrasunny', label: 'ExtraSunny' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'smog', label: 'Smog' },
  { value: 'foggy', label: 'Foggy' },
  { value: 'overcast', label: 'Overcast' },
  { value: 'clouds', label: 'Clouds' },
  { value: 'clearing', label: 'Clearing' },
  { value: 'rain', label: 'Rain' },
  { value: 'thunder', label: 'Thunder' },
  { value: 'snow', label: 'Snow' },
  { value: 'blizzard', label: 'Blizzard' },
  { value: 'snowlight', label: 'Snowlight' },
  { value: 'xmas', label: 'Xmas' },
  { value: 'halloween', label: 'Halloween' },
]

const World: React.FC = () => {
  const { locale } = useLocales()
  const [hourValue, setHourValue] = useAtom(worldHourAtom)
  const [minuteValue, setMinuteValue] = useAtom(worldMinuteAtom)
  const [weatherValue, setWeatherValue] = useAtom(worldWeatherAtom)
  const [cloudsOpacity, setCloudsOpacity] = useAtom(worldCloudsOpacityAtom)
  const [timeFrozen, setTimeFrozen] = useAtom(worldFreezeTimeAtom)
  const [weatherFrozen, setWeatherFrozen] = useAtom(worldFreezeWeatherAtom)

  const setHour = (value: number) => {
    setHourValue(value)
    fetchNui('dolu_tool:setClock', { hour: value, minute: minuteValue })
  }

  const setMinute = (value: number) => {
    setMinuteValue(value)
    fetchNui('dolu_tool:setClock', { hour: hourValue, minute: value })
  }

  return (
    <SimpleGrid cols={1}>
      <Stack>
        {/* Time    */}
        <Paper p='md'>
          <Group justify='space-between' align='baseline'>
            <Text fz={20} fw={600}>{locale.ui_time}</Text>
            <Text fz={18} fw={600} c='blue.4'>
              {String(hourValue).padStart(2, '0')}:{String(minuteValue).padStart(2, '0')}
            </Text>
          </Group>

          <Space h='sm' />

          <Text fz={14} mb={4}>{locale.ui_hour}</Text>
          <Group wrap='nowrap' gap='xs'>
            <ActionIcon variant='light' color='blue.4' radius='md' onClick={() => setHour((hourValue + 23) % 24)}>
              <TbMinus fontSize={16} />
            </ActionIcon>
            <Slider
              style={{ flex: 1 }}
              color='blue.4'
              min={0}
              max={23}
              step={1}
              value={hourValue}
              onChange={setHour}
            />
            <ActionIcon variant='light' color='blue.4' radius='md' onClick={() => setHour((hourValue + 1) % 24)}>
              <TbPlus fontSize={16} />
            </ActionIcon>
          </Group>

          <Space h='sm' />

          <Text fz={14} mb={4}>{locale.ui_minutes}</Text>
          <Group wrap='nowrap' gap='xs'>
            <ActionIcon variant='light' color='blue.4' radius='md' onClick={() => setMinute((minuteValue + 59) % 60)}>
              <TbMinus fontSize={16} />
            </ActionIcon>
            <Slider
              style={{ flex: 1 }}
              color='blue.4'
              min={0}
              max={59}
              step={1}
              value={minuteValue}
              onChange={setMinute}
            />
            <ActionIcon variant='light' color='blue.4' radius='md' onClick={() => setMinute((minuteValue + 1) % 60)}>
              <TbPlus fontSize={16} />
            </ActionIcon>
          </Group>

          <Space h='md' />

          <Group justify='space-between'>
            <Checkbox label={locale.ui_freeze_time} checked={timeFrozen} onChange={(e) => {
              setTimeFrozen(e.currentTarget.checked)
              fetchNui('dolu_tool:freezeTime', e.currentTarget.checked)
            }} />

            <Button
              color='blue.4'
              variant='light'
              onClick={() => fetchNui('dolu_tool:getClock')}
            >
              {locale.ui_sync}
            </Button>
          </Group>
        </Paper>

        {/* Weather */}
        <Paper p='md'>
          <Text fz={20} fw={600} mb='md'>{locale.ui_weather}</Text>

          <SimpleGrid cols={3} spacing='xs'>
            {WEATHER_TYPES.map((weather) => (
              <Button
                key={weather.value}
                variant={weatherValue === weather.value ? 'outline' : 'default'}
                color='blue.4'
                radius='md'
                size='xs'
                onClick={() => {
                  setWeatherValue(weather.value)
                  fetchNui('dolu_tool:setWeather', weather.value)
                }}
              >
                {weather.label}
              </Button>
            ))}
          </SimpleGrid>

          <Space h='md' />

          <Group gap={6} mb={4} align='center'>
            <Text fz={14}>{locale.ui_clouds_opacity}</Text>
            <Tooltip label={locale.ui_clouds_opacity_info} position='top' multiline w={230} transitionProps={{ transition: 'scale-y' }}>
              <Text component='span' c='dimmed' lh={0} style={{ cursor: 'help' }}>
                <TbHelpCircle fontSize={16} />
              </Text>
            </Tooltip>
          </Group>
          <Slider
            color='blue.4'
            min={0}
            max={100}
            step={1}
            value={cloudsOpacity}
            label={(value) => `${value}%`}
            onChange={(value) => {
              setCloudsOpacity(value)
              fetchNui('dolu_tool:setCloudsOpacity', value)
            }}
          />

          <Space h='md' />

          <Group>
            <Checkbox label={locale.ui_freeze_weather} checked={weatherFrozen} onChange={(e) => {
              setWeatherFrozen(e.currentTarget.checked)
              fetchNui('dolu_tool:freezeWeather', e.currentTarget.checked)
            }} />
          </Group>
        </Paper>
      </Stack>
    </SimpleGrid>
  )
}

export default World
