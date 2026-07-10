import { Button, Divider, Group, NumberInput, Stack, Text, TextInput } from '@mantine/core'
import { closeAllModals } from '@mantine/modals'
import { useState } from 'react'
import { useLocales } from '../../../../../providers/LocaleProvider'
import { fetchNui } from '../../../../../utils/fetchNui'

const SetCoords: React.FC = () => {
    const { locale } = useLocales()
    const [coordString, setCoordString] = useState('0.0, 0.0, 0.0')
    const [coordX, setCoordX] = useState(0)
    const [coordY, setCoordY] = useState(0)
    const [coordZ, setCoordZ] = useState(0)

    return (
        <Stack>
            <Text fw={500}>{locale.ui_set_coords_as_string}</Text>
            <TextInput value={coordString} onChange={(e) => setCoordString(e.target.value)} />
            <Button
                tt='uppercase'
                disabled={coordString === ''}
                variant='light'
                color='blue.4'
                onClick={() => {
                    closeAllModals()
                    fetchNui('dolu_tool:setCustomCoords', { coordString: coordString })
                }}
            >{locale.ui_confirm}</Button>

            <Divider my='sm' />
            <Text fw={500}>{locale.ui_set_coords_separate}</Text>

            <Group grow style={{ maxWidth:300 }}>
                <NumberInput clampBehavior='none' defaultValue={0.0} label="X" value={coordX} onChange={(value) => typeof value === 'number' && setCoordX(value)} step={0.5} stepHoldDelay={500} stepHoldInterval={(t) => Math.max(1000 / t ** 2, 25)} />
                <NumberInput clampBehavior='none' defaultValue={0.0} label="Y" value={coordY} onChange={(value) => typeof value === 'number' && setCoordY(value)} step={0.5} stepHoldDelay={500} stepHoldInterval={(t) => Math.max(1000 / t ** 2, 25)} />
                <NumberInput clampBehavior='none' defaultValue={0.0} label="Z" value={coordZ} onChange={(value) => typeof value === 'number' && setCoordZ(value)} step={0.5} stepHoldDelay={500} stepHoldInterval={(t) => Math.max(1000 / t ** 2, 25)} />
            </Group>

            <Button
                tt='uppercase'
                disabled={coordString === ''}
                variant='light'
                color='blue.4'
                onClick={() => {
                    closeAllModals()
                    fetchNui('dolu_tool:setCustomCoords', { coords: { x: coordX, y: coordY, z: coordZ } })
                }}
            >{locale.ui_confirm}</Button>
        </Stack>
        )
    }

    export default SetCoords
