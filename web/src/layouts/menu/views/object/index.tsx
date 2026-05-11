import { useEffect, useState } from 'react'
import { useRecoilState } from 'recoil'
import { Accordion, ActionIcon, Button, Group, Paper, ScrollArea, Space, Text, TextInput } from '@mantine/core'
import { openModal } from '@mantine/modals'
import { MdLibraryAdd, MdDeleteForever } from 'react-icons/md'
import { Entity, ObjectListAtom, objectDataPayloadSchema, objectListPayloadSchema } from '../../../../atoms/object'
import { fetchNui } from '../../../../utils/fetchNui'
import AddEntity from './components/modals/AddEntity'
import { useNuiValidatedEvent } from '../../../../hooks/useNuiValidatedEvent'
import DeleteAllEntities from './components/modals/DeleteAllEntities'
import { setClipboard } from '../../../../utils/setClipboard'
import { useLocales } from '../../../../providers/LocaleProvider'
import { debugData } from '../../../../utils/debugData'

debugData([
    {
        action: 'setObjectList',
        data: {
            entitiesList: [
                {
                    handle: 123456,
                    name: 'object 1',
                    position: {
                        x: 0,
                        y: 0,
                        z: 0
                    },
                    rotation: {
                        x: 0,
                        y: 0,
                        z: 0
                    },
                    frozen: false,
                    invalid: false
                },
                {
                    handle: 1234567,
                    name: 'object 2',
                    position: {
                        x: 0,
                        y: 0,
                        z: 0
                    },
                    rotation: {
                        x: 0,
                        y: 0,
                        z: 0
                    },
                    frozen: false,
                    invalid: false
                },
                {
                    handle: 12345678,
                    name: 'object 3',
                    position: {
                        x: 0,
                        y: 0,
                        z: 0
                    },
                    rotation: {
                        x: 0,
                        y: 0,
                        z: 0
                    },
                    frozen: false,
                    invalid: false
                }
            ]
        }
    }
])

const Object: React.FC = () => {
    const { locale } = useLocales()
    const [objectList, setObjectList] = useRecoilState(ObjectListAtom)
    const [currentAccordionItem, setAccordionItem] = useState<string|null>(null)

    const [copiedName, setCopiedName] = useState<boolean>(false)
    const [copiedCoords, setCopiedCoords] = useState<boolean>(false)
    const [copiedRotation, setCopiedRotation] = useState<boolean>(false)

    useNuiValidatedEvent('setObjectList', objectListPayloadSchema, (data) => {
        if (data.entitiesList === null) return;
        setObjectList(data.entitiesList)
    })

    useNuiValidatedEvent('setObjectData', objectDataPayloadSchema, (data) => {
        if (!data.entity?.id) {
            setAccordionItem(null)
            return
        };

        setObjectList(currentList => {
            return currentList.map(entity => 
                entity.id === data.entity.id ? data.entity : entity
            );
        });
        
        setAccordionItem(data.entity.id);
    });

    useEffect(() => {
        setTimeout(() => {
            setCopiedCoords(false)
            setCopiedRotation(false)
            setCopiedName(false)
        }, 1000)
    }, [copiedCoords, copiedRotation, copiedName])
    
    return (
        <>
        {/* TITLE */}
        <Group position='apart'>
            <Text size={20}>{locale.ui_object_spawner}</Text>
            <Group position='apart'>
            <ActionIcon
                size='xl'
                color='blue.4'
                onClick={() =>
                    openModal({
                        title: locale.ui_add_entity,
                        size: 'xs',
                        children: <AddEntity />
                    })
                }
            >
                <MdLibraryAdd fontSize={30} />
            </ActionIcon>
            <ActionIcon
                disabled={objectList.length < 1}
                size='xl'
                color='red.4'
                onClick={() =>
                    openModal({
                        title: locale.ui_delete_all_entities,
                        size: 'md',
                        children: <DeleteAllEntities />
                    })
                }
            >
                <MdDeleteForever fontSize={30} />
            </ActionIcon>
            </Group>
        </Group>
        
        <Space h='sm' />
        
        {/* OBJECT LIST*/}
        <Paper p='md' sx={{ height:685 }}>
            <ScrollArea style={{ height: 650, borderRadius: '5px' }} offsetScrollbars scrollbarSize={12}>
                <Accordion
                    variant='contained'
                    radius='sm'
                    chevronPosition='left'
                    value={currentAccordionItem}
                    defaultValue={currentAccordionItem}
                    onChange={(value) => {
                        setAccordionItem(value)
                        fetchNui('dolu_tool:setGizmoEntity', value)
                    }}
                >
                        {objectList.map((entity: Entity) => {
                            return (
                                <Accordion.Item key={entity.id} value={entity.id}>
                                    <Accordion.Control>
                                        <TextInput
                                            error={entity.invalid}
                                            defaultValue={entity.name}
                                            onChange={
                                                (e) => e.currentTarget.value !== '' &&
                                                    fetchNui('dolu_tool:setEntityModel', { entity: entity, modelName: e.currentTarget.value })
                                            }
                                        />
                                    </Accordion.Control>
                                    <Accordion.Panel>
                                        <Group grow>
                                            <Button
                                                variant='light'
                                                color='blue.4'
                                                size='xs'
                                                onClick={() => {
                                                    fetchNui('dolu_tool:snapEntityToGround', entity)
                                                }}
                                            >{locale.ui_snap_to_ground}</Button>
                                            <Button
                                                variant='light'
                                                color={copiedCoords ? 'teal' : 'blue.4'}
                                                size='xs'
                                                onClick={() => {
                                                    setClipboard(entity.position.x + ', ' + entity.position.y + ', ' + entity.position.z)
                                                    setCopiedCoords(true)
                                                }}
                                            >{copiedCoords ? locale.ui_copied_coords : locale.ui_copy_coords}</Button>
                                            <Button
                                                variant='light'
                                                color={copiedRotation ? 'teal' : 'blue.4'}
                                                size='xs'
                                                onClick={() => {
                                                    setClipboard(entity.rotation.x + ', ' + entity.rotation.y + ', ' + entity.rotation.z)
                                                    setCopiedRotation(true)
                                                }}
                                            >{copiedRotation ? locale.ui_copied_rotation : locale.ui_copy_rotation}</Button>
                                        </Group>
                                        <Space h='xs' />
                                        <Group grow>
                                            <Button
                                                variant='light'
                                                color='blue.4'
                                                size='xs'
                                                onClick={() => {
                                                    fetchNui('dolu_tool:goToEntity', entity)
                                                }}
                                            >{locale.ui_goto}</Button>
                                            <Button
                                                variant='light'
                                                color={copiedName ? 'teal' : 'blue.4'}
                                                size='xs'
                                                onClick={() => {
                                                    setClipboard(entity.name)
                                                    setCopiedName(true)
                                                }}
                                            >{copiedName ? locale.ui_copied_name : locale.ui_copy_name}</Button>
                                            <Button
                                                variant='light'
                                                color='blue.4'
                                                size='xs'
                                                onClick={() => {
                                                    fetchNui('dolu_tool:addEntity', entity.name)
                                                }}
                                            >{locale.ui_duplicate}</Button>
                                            <Button
                                                variant='light'
                                                color='blue.4'
                                                size='xs'
                                                onClick={() => {
                                                    fetchNui('dolu_tool:deleteEntity', entity.id)
                                                    setAccordionItem(null)
                                                }}
                                            >{locale.ui_delete}</Button>
                                        </Group>
                                    </Accordion.Panel>
                                </Accordion.Item>
                            )
                        })}
                </Accordion>
                </ScrollArea>
            </Paper>
        </>
    )
}

export default Object
