import { Text, Stack, SimpleGrid, Paper, Group, Select, NumberInput, Button, Space, Checkbox } from '@mantine/core'
import { fetchNui } from '../../../../utils/fetchNui'
import { useNuiEvent } from '../../../../hooks/useNuiEvent'
import { useAtom } from 'jotai'
import { worldFreezeTimeAtom, worldFreezeWeatherAtom, worldHourAtom, worldMinuteAtom, worldWeatherAtom } from '../../../../atoms/world'
import { useLocales } from '../../../../providers/LocaleProvider'

const World: React.FC = () => {
  const { locale } = useLocales()
  const [hourValue, setHourValue] = useAtom(worldHourAtom)
  const [minuteValue, setMinuteValue] = useAtom(worldMinuteAtom)
  const [weatherValue, setWeatherValue] = useAtom(worldWeatherAtom)
  const [timeFrozen, setTimeFrozen] = useAtom(worldFreezeTimeAtom)
  const [weatherFrozen, setWeatherFrozen] = useAtom(worldFreezeWeatherAtom)

  useNuiEvent('setWorldData', (data: any) => {
    setWeatherValue(data.weather)
    setHourValue(data.clock.hour)
    setMinuteValue(data.clock.minute)
  })

  useNuiEvent('setClockData', (data: any) => {
    setHourValue(data.hour)
    setMinuteValue(data.minute)
  })

  return (
    <SimpleGrid cols={1}>
      <Stack>
        {/* Time    */}
        <Paper p='md'>
          <Text fz={20} fw={600}>{locale.ui_time}</Text>

          <Space h='sm' />

          <Group grow>
            <NumberInput
              value={hourValue}
              defaultValue={hourValue}
              placeholder={hourValue.toString()}
              radius='md'
              max={24}
              min={0}
              stepHoldDelay={500}
              stepHoldInterval={(t) => Math.max(1000 / t ** 2, 25)}
              onChange={(value) => {
                if (typeof value === 'number') {
                  setHourValue(value)
                  fetchNui('dolu_tool:setClock', { hour: value, minute: minuteValue})
                }
              }}
            />
            {':'}
            <NumberInput
              value={minuteValue}
              defaultValue={minuteValue}
              radius='md'
              max={60}
              min={0}
              stepHoldDelay={500}
              stepHoldInterval={(t) => Math.max(1000 / t ** 2, 25)}
              onChange={(value) => {
                if (typeof value !== 'number') return
                setMinuteValue(value)
                fetchNui('dolu_tool:setClock', { hour: hourValue, minute: value})
              }}
            />

            <Button
              color='blue.4'
              variant='light'
              onClick={() => fetchNui('dolu_tool:getClock')}
            >
              {locale.ui_sync}
            </Button>
          </Group>

          <Space h='sm' />

          <Group>
            <Checkbox label={locale.ui_freeze_time} checked={timeFrozen} onChange={(e) => {
              setTimeFrozen(e.currentTarget.checked)
              fetchNui('dolu_tool:freezeTime', e.currentTarget.checked)
            }} />
          </Group>
        </Paper>

        {/* Weather */}
        <Paper p='md'>
          <Text fz={20} fw={600} mb='md'>{locale.ui_weather}</Text>

          <Group>
            <Select
              label={locale.ui_choose_weather}
              placeholder={locale.ui_current_weather}
              defaultValue={weatherValue}
              value={weatherValue}
              onChange={(value) => {
                value && setWeatherValue(value)
                fetchNui('dolu_tool:setWeather', value)
              }}
              data={[
                { value: 'clear', label: "Clear" },
                { value: 'extraSunny', label: "ExtraSunny" },
                { value: 'neutral', label: "Neutral" },
                { value: 'smog', label: "Smog" },
                { value: 'foggy', label: "Foggy" },
                { value: 'overcast', label: "Overcast" },
                { value: 'clouds', label: "Clouds" },
                { value: 'clearing', label: "Clearing" },
                { value: 'rain', label: "Rain" },
                { value: 'thunder', label: "Thunder" },
                { value: 'snow', label: "Snow" },
                { value: 'blizzard', label: "Blizzard" },
                { value: 'snowlight', label: "Snowlight" },
                { value: 'xmas', label: "Xmas" },
                { value: 'halloween', label: "Halloween" },
              ]}
            />
          </Group>

          <Space h='sm' />

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
