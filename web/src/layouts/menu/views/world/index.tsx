import { Text, Stack, SimpleGrid, Paper, Group, Select, NumberInput, Button, Space, Checkbox } from '@mantine/core'
import { AiOutlineClockCircle } from 'react-icons/ai'
import { TiWeatherPartlySunny } from 'react-icons/ti'
import { fetchNui } from '../../../../utils/fetchNui'
import { useNuiValidatedEvent } from '../../../../hooks/useNuiValidatedEvent'
import { useRecoilState } from 'recoil'
import { clockDataSchema, worldDataSchema, worldFreezeTimeAtom, worldFreezeWeatherAtom, worldHourAtom, worldMinuteAtom, worldWeatherAtom } from '../../../../atoms/world'
import { useLocales } from '../../../../providers/LocaleProvider'

const World: React.FC = () => {
  const { locale } = useLocales()
  const [hourValue, setHourValue] = useRecoilState(worldHourAtom)
  const [minuteValue, setMinuteValue] = useRecoilState(worldMinuteAtom)
  const [weatherValue, setWeatherValue] = useRecoilState(worldWeatherAtom)
  const [timeFrozen, setTimeFrozen] = useRecoilState(worldFreezeTimeAtom)
  const [weatherFrozen, setWeatherFrozen] = useRecoilState(worldFreezeWeatherAtom)

  useNuiValidatedEvent('setWorldData', worldDataSchema, (data) => {
    setWeatherValue(data.weather)
    setHourValue(data.clock.hour)
    setMinuteValue(data.clock.minute)
  })

  useNuiValidatedEvent('setClockData', clockDataSchema, (data) => {
    setHourValue(data.hour)
    setMinuteValue(data.minute)
  })

  return (
    <SimpleGrid cols={1}>
      <Stack>
        {/* Time    */}
        <Paper p='md'>
          <Group position='apart'>
            <Text size={20} weight={600}>{locale.ui_time}</Text>
            <AiOutlineClockCircle size={24} />
          </Group>

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
              onChange={(value: number) => {
                if (value) {
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
              onChange={(value: number) => {
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
          <Group position='apart'>
            <Text size={20} weight={600}>{locale.ui_weather}</Text>
            <TiWeatherPartlySunny size={24} />
          </Group>

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
