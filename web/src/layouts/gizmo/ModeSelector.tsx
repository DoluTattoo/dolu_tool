import { ActionIcon, Box, Button, Flex, Group, Indicator, Menu, NumberInput, Overlay, Text, TextInput, Tooltip } from "@mantine/core"
import { LuRotate3D, LuMove, LuMagnet } from "react-icons/lu"
import { BiWorld } from "react-icons/bi"
import { TbGizmo } from "react-icons/tb"
import { FaKeyboard } from "react-icons/fa"
import { BsCheckLg, BsClipboard } from "react-icons/bs"
import { RxCross2 } from "react-icons/rx"
import { FiEdit } from "react-icons/fi"
import { useAtom } from "jotai"
import React, { useCallback, useState } from "react"
import { KeyboardLayoutAtom, RotateSnapAtom, TranslateSnapAtom } from "../../atoms/object"
import { setClipboard } from "../../utils/setClipboard"
import { fetchNui } from "../../utils/fetchNui"

const stringToVec3 = (input: string): [number, number, number] | null => {
  // Remove leading and trailing whitespace, then split on comma or space
  const parts = input.trim().split(/[\s,]+/);

  // Make sure there are exactly three parts
  if (parts.length !== 3) {
    return null;
  }

  // Convert parts to numbers and check if any are NaN
  const x = parseFloat(parts[0]);
  const y = parseFloat(parts[1]);
  const z = parseFloat(parts[2]);

  if (isNaN(x) || isNaN(y) || isNaN(z)) {
    return null;
  }

  // Return the coordinates
  return [x, y, z];
}

export const ModeSelector = React.memo(({ onChangeSpace, onChangeMode, space, mode, currentEntity }: ModeSelector) => {
  const [layout, setLayout] = useAtom(KeyboardLayoutAtom);

  const positionString = `${currentEntity?.position.x.toFixed(3)}, ${currentEntity?.position.y.toFixed(3)}, ${currentEntity?.position.z.toFixed(3)}`
  const rotationString = `${currentEntity?.rotation.x.toFixed(3)}, ${currentEntity?.rotation.y.toFixed(3)}, ${currentEntity?.rotation.z.toFixed(3)}`
  const [posString, setPosString] = useState(positionString);
  const [rotString, setRotString] = useState(rotationString);


  const handleTranslateClick = useCallback(() => {
    onChangeMode('translate');
  }, [onChangeMode]);

  const handleRotateClick = useCallback(() => {
    onChangeMode('rotate');
  }, [onChangeMode]);

  const handleLayoutSwitch = useCallback(() => {
    setLayout(prevLayout => prevLayout === 'QWERTY' ? 'AZERTY' : 'QWERTY');
  }, [setLayout]);

  const handleConfirmPosition = () => {
    setPosEditMode(false);

    const coordinates = stringToVec3(posString);

    if (coordinates === null) {
      console.log('Invalid position input!');
      return;
    }

    const tempEntity = { ...currentEntity };
    tempEntity.position = { x: coordinates[0], y: coordinates[1], z: coordinates[2] } as TransformEntity['position'];

    fetchNui('dolu_tool:moveEntity', tempEntity);
  };

  const handleConfirmRotation = () => {
    setRotEditMode(false);

    const coordinates = stringToVec3(rotString);

    if (coordinates === null) {
      console.log('Invalid rotation input!');
      return;
    }

    const tempEntity = { ...currentEntity };
    tempEntity.rotation = { x: coordinates[0], y: coordinates[1], z: coordinates[2] } as TransformEntity['rotation'];

    fetchNui('dolu_tool:moveEntity', tempEntity);
  }

  const [posEditMode, setPosEditMode] = useState(false)
  const [rotEditMode, setRotEditMode] = useState(false)

  const [snapMenuOpened, setSnapMenuOpened] = useState(false)
  const [translateSnap, setTranslateSnap] = useAtom(TranslateSnapAtom)
  const [rotateSnap, setRotateSnap] = useAtom(RotateSnapAtom)

  return (
    <>
      <Box className='dolu-gizmo-selector'>
        <Tooltip label='Transformation orientation (Shortcut: Q)'>
          <Button variant="filled" color="dark.7" radius="sm" className='dolu-gizmo-active' onClick={onChangeSpace}>
            {space === 'local' ? <TbGizmo fontSize={'1.5rem'} /> : <BiWorld fontSize={'1.5rem'} />}
          </Button>
        </Tooltip>

        <Button.Group>
          <Tooltip label='Translate mode (Shortcut: W)'>
            <Indicator label={<LuMagnet fontSize={'0.8rem'} />} size={0} position="top-start" offset={10} disabled={translateSnap === undefined || translateSnap < 0.0176}>
              <Button variant="filled" color="dark.7" radius="sm" className={mode === 'translate' ? 'dolu-gizmo-active' : ''} onClick={handleTranslateClick}>
                <LuMove fontSize={'1.5rem'} />
              </Button>
            </Indicator>
          </Tooltip>

          <Tooltip label='Rotate mode (Shortcut: R)'>
            <Indicator label={<LuMagnet fontSize={'0.8rem'} />} size={0} position="top-start" offset={10} disabled={rotateSnap === undefined || rotateSnap < 0.0176}>
              <Button variant="filled" color="dark.7" radius="sm" className={mode === 'rotate' ? 'dolu-gizmo-active' : ''} onClick={handleRotateClick}>
                <LuRotate3D fontSize={'1.5rem'} />
              </Button>
            </Indicator>
          </Tooltip>
        </Button.Group>

        <Menu styles={{ dropdown: { backgroundColor: 'var(--mantine-color-dark-7)' } }} shadow="md" opened={snapMenuOpened} onChange={setSnapMenuOpened} withArrow>
          <Menu.Target>
            <Button variant="filled" color="dark.7" radius="sm" className='dolu-gizmo-active'>
              <LuMagnet fontSize={'1.5rem'} />
            </Button>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>
              Translation Snap
            </Menu.Label>
            <Menu.Label>
              <Group justify="space-between">
                <NumberInput
                  value={translateSnap !== undefined ? translateSnap * (180 / Math.PI) : 0}
                  onChange={(value) => typeof value === 'number' && value && setTranslateSnap(value * (Math.PI / 180))}
                  min={0}
                  max={90}
                  step={1}
                  stepHoldDelay={500}
                  stepHoldInterval={(t) => Math.max(1000 / t ** 2, 25)}
                  leftSection={<LuMove size='1rem' />}
                  maw={100}
                />
                <ActionIcon size="md" variant="light" color="red" onClick={() => setTranslateSnap(0)}><RxCross2 /></ActionIcon>
              </Group>
            </Menu.Label>

            <Menu.Divider />

            <Menu.Label>
              Rotation Snap
            </Menu.Label>
            <Menu.Label>
              <Group>
                <NumberInput
                  value={rotateSnap !== undefined ? rotateSnap * (180 / Math.PI) : 0}
                  onChange={(value) => typeof value === 'number' && value && setRotateSnap(value * (Math.PI / 180))}
                  min={0}
                  max={90}
                  step={1}
                  stepHoldDelay={500}
                  stepHoldInterval={(t) => Math.max(1000 / t ** 2, 25)}
                  leftSection={<LuRotate3D size='1rem' />}
                  maw={100}
                />
                <ActionIcon size="md" variant="light" color="red" onClick={() => setRotateSnap(0)}><RxCross2 /></ActionIcon>
              </Group>
            </Menu.Label>
          </Menu.Dropdown>
        </Menu>

        <Tooltip zIndex={1} label={`Switch to ${layout === 'QWERTY' ? 'AZERTY' : 'QWERTY'} keyboard layout`}>
          <Button variant="filled" color="dark.7" radius="sm" leftSection={<FaKeyboard fontSize={'1.5rem'} />} className='dolu-gizmo-active' onClick={handleLayoutSwitch}>
            {layout}
          </Button>
        </Tooltip>
      </Box>

      <Box className='dolu-gizmo-infos'>
        <Group justify="space-between">
          <Group>
            <Text>{`Model:`}</Text>
            <Text c='blue.4' >{currentEntity?.name}</Text>
          </Group>

          <ActionIcon
            variant='subtle'
            onClick={() => { currentEntity?.name && setClipboard(currentEntity.name.toString()) }}
          ><BsClipboard /></ActionIcon>
        </Group>

        <Group justify="space-between">
          <Group>
            <Text>{`Hash:`}</Text>
            <Text c='blue.4' >{currentEntity?.hash}</Text>
          </Group>
          <ActionIcon
            variant='subtle'
            onClick={() => { currentEntity?.hash && setClipboard(currentEntity.hash.toString()) }}
          ><BsClipboard /></ActionIcon>
        </Group>

        <Group justify="space-between">
          <Group>
            <Text>{`Handle:`}</Text>
            <Text c='blue.4' >{currentEntity?.handle}</Text>
          </Group>
          <ActionIcon
            variant='subtle'
            onClick={() => { currentEntity?.handle && setClipboard(currentEntity.handle.toString()) }}
          ><BsClipboard /></ActionIcon>
        </Group>

        {posEditMode ?
          <Group>
            <Text>{`Position:`}</Text>
            <TextInput
              defaultValue={positionString}
              w={290}
              rightSection={
                <Flex
                  mr={35}
                  gap='0.25rem'
                >
                  <ActionIcon
                    size="md"
                    variant="light"
                    color="teal"
                    onClick={handleConfirmPosition}
                    disabled={!stringToVec3(posString)}
                  ><BsCheckLg /></ActionIcon>
                  <ActionIcon
                    size="md"
                    variant="light"
                    color="red"
                    onClick={() => { setPosEditMode(false) }}
                  ><RxCross2 /></ActionIcon>
                </Flex>
              }
              onChange={(e) => setPosString(e.currentTarget.value)}
            />
          </Group>
          :
          <Group justify="space-between">
            <Group>
              <Text>{`Position:`}</Text>
              <Text c='blue.4' >{positionString}</Text>
            </Group>
            <ActionIcon
              variant='subtle'
              onClick={() => { !rotEditMode && setPosEditMode(true) }}
            ><FiEdit /></ActionIcon>
          </Group>
        }

        {rotEditMode ?
          <Group>
            <Text>{`Rotation:`}</Text>
            <TextInput
              defaultValue={rotationString}
              w={290}
              rightSection={
                <Flex
                  mr={35}
                  gap='0.25rem'
                >
                  <ActionIcon
                    size="md"
                    variant="light"
                    color="teal"
                    onClick={handleConfirmRotation}
                    disabled={!stringToVec3(rotString)}
                  ><BsCheckLg /></ActionIcon>
                  <ActionIcon
                    size="md"
                    variant="light"
                    color="red"
                    onClick={() => { setRotEditMode(false) }}
                  ><RxCross2 /></ActionIcon>
                </Flex>
              }
              onChange={(e) => setRotString(e.currentTarget.value)}
            />
          </Group>
          :
          <Group justify="space-between">
            <Group>
              <Text>{`Rotation:`}</Text>
              <Text c='blue.4' >{rotationString}</Text>
            </Group>
            <ActionIcon
              variant='subtle'
              onClick={() => { !posEditMode && setRotEditMode(true) }}
            ><FiEdit /></ActionIcon>
          </Group>
        }

        {snapMenuOpened && (
          <Overlay
            color="black"
            backgroundOpacity={0.75}
            radius='sm'
          />
        )}
      </Box>
    </>
  )
})
