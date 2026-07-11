import { Button, Checkbox, Divider, Group, NumberInput, Paper, Select, SimpleGrid, Slider, Stack, Text } from '@mantine/core'
import { useDebouncedValue } from '@mantine/hooks'
import { useEffect, useState } from 'react'
import { BsFillStopFill, BsPlayFill } from 'react-icons/bs'
import { useAtom } from 'jotai'
import { drawStaticEmittersAtom, radioStationsListAtom, StaticEmitter, staticEmittersDrawDistanceAtom, staticEmittersListAtom } from '../../../../atoms/audio'
import { useNuiEvent } from '../../../../hooks/useNuiEvent'
import { useLocales } from "../../../../providers/LocaleProvider"
import { fetchNui } from '../../../../utils/fetchNui'
import { CopyableRow, Row, SectionHeader } from '../interior/components/PropertyRow'

const Audio: React.FC = () => {
    const { locale } = useLocales()
    const [checked, setChecked] = useAtom(drawStaticEmittersAtom)
    const [drawDistance, setDrawDistance] = useAtom(staticEmittersDrawDistanceAtom)
    const [closestEmitter, setClosestEmitter] = useAtom(staticEmittersListAtom)
    const [radioStation, setRadioStation] = useState<string>("Unknown")
    const [radioStationsList, setRadioStationsList] = useAtom(radioStationsListAtom)
    const [debouncedDistance] = useDebouncedValue(drawDistance, 200)

    useNuiEvent('setClosestEmitter', (data: StaticEmitter) => {
        setClosestEmitter(data)
        setRadioStation(data.radiostation)
    })

    useNuiEvent('setRadioStationsList', (data: Array<{ label: string, value: string }>) => {
        setRadioStationsList(data)
    })

    useEffect(() => {
       fetchNui('dolu_tool:setStaticEmitterDrawDistance', debouncedDistance)
    }, [debouncedDistance])

    useEffect(() => {
       fetchNui('dolu_tool:setDrawStaticEmitters', checked)
    }, [checked])

    return (
        <SimpleGrid cols={1}>
            <Stack gap='sm'>
                {/* STATIC EMITTERS */}
                <Paper p='md'>
                    <SectionHeader title={locale.ui_static_emitters} />

                    <Checkbox
                        color='blue.4'
                        label={locale.ui_draw_static_emitters}
                        checked={checked}
                        onChange={(e) => setChecked(e.currentTarget.checked)}
                    />

                    <Group justify='space-between' wrap='nowrap' mt='md'>
                        <Text size='sm'>{locale.ui_draw_distance}</Text>
                        <NumberInput
                            disabled={!checked}
                            value={drawDistance}
                            min={1}
                            max={100}
                            size='sm'
                            style={{ maxWidth: 130 }}
                            onChange={(value) => typeof value === 'number' && setDrawDistance(value)}
                            suffix={` ${locale.ui_meters}`}
                            thousandSeparator=','
                        />
                    </Group>

                    <Slider
                        mt='sm'
                        disabled={!checked}
                        value={drawDistance}
                        label={(value) => `${value} ${locale.ui_meters}`}
                        onChange={(value) => setDrawDistance(value)}
                        min={1}
                        max={100}
                        marks={[{ value: 20 }, { value: 40 }, { value: 60 }, { value: 80 }]}
                    />
                </Paper>

                {/* CLOSEST EMITTER INFO */}
                <Paper p='md'>
                    <Group justify='space-between' wrap='nowrap' mb={6}>
                        <Text fz={18} fw={600}>{locale.ui_closest_emitter_info}</Text>
                        <Button size='xs' color='blue.4' variant='light' onClick={() => fetchNui('dolu_tool:getClosestStaticEmitter')}>
                            {locale.ui_refresh}
                        </Button>
                    </Group>

                    <Stack gap={1}>
                        <CopyableRow label={locale.ui_name} value={closestEmitter.name} copyLabel={locale.ui_copy} copiedLabel={locale.ui_copied} />
                        <CopyableRow label={locale.ui_coords} value={closestEmitter.coords} copyLabel={locale.ui_copy} copiedLabel={locale.ui_copied} />
                        <CopyableRow label={locale.ui_distance} value={`${closestEmitter.distance} ${locale.ui_meters}`} copyLabel={locale.ui_copy} copiedLabel={locale.ui_copied} />
                        <CopyableRow label={locale.ui_flags} value={closestEmitter.flags} copyLabel={locale.ui_copy} copiedLabel={locale.ui_copied} />
                        <CopyableRow label={locale.ui_interior} value={closestEmitter.interior} copyLabel={locale.ui_copy} copiedLabel={locale.ui_copied} />
                        <CopyableRow label={locale.ui_room} value={closestEmitter.room} copyLabel={locale.ui_copy} copiedLabel={locale.ui_copied} />

                        <Row label={locale.ui_radio_station}>
                            <Select
                                searchable
                                size='sm'
                                nothingFoundMessage={locale.ui_no_timecycle_found}
                                data={radioStationsList}
                                value={radioStation}
                                onChange={(value) => {
                                    setRadioStation(value!)
                                    fetchNui('dolu_tool:setStaticEmitterRadio', { emitterName: closestEmitter.name, radioStation: value })
                                }}
                                style={{ flex: 1, minWidth: 0 }}
                            />
                        </Row>
                    </Stack>

                    <Divider my={8} variant='dashed' />

                    <Group grow gap='xs'>
                        <Button color='teal.4' variant='light' onClick={() => fetchNui('dolu_tool:toggleStaticEmitter', { emitterName: closestEmitter.name, state: true })}>
                            <BsPlayFill />
                        </Button>
                        <Button color='red.4' variant='light' onClick={() => fetchNui('dolu_tool:toggleStaticEmitter', { emitterName: closestEmitter.name, state: false })}>
                            <BsFillStopFill />
                        </Button>
                    </Group>
                </Paper>
            </Stack>
        </SimpleGrid>
    )
}

export default Audio
