-- Object tab: object spawner & gizmo

local idCounter = 0

local function generateUniqueId()
    idCounter += 1
    return string.format("%x-%x", GetGameTimer(), idCounter)
end

local function rotationToDirection(rotation)
    local adjustedRotation = vec3(
        (math.pi / 180) * rotation.x,
        (math.pi / 180) * rotation.y,
        (math.pi / 180) * rotation.z
    )

    local direction = vec3(
        -math.sin(adjustedRotation.z) * math.abs(math.cos(adjustedRotation.x)),
        math.cos(adjustedRotation.z) * math.abs(math.cos(adjustedRotation.x)),
        math.sin(adjustedRotation.x)
    )

    return direction
end

local function raycast(maxDistance, ignore)
    local screenPosition = { x = GetDisabledControlNormal(0, 239), y = GetDisabledControlNormal(0, 240) }
    local pos = GetFinalRenderedCamCoord()
    local rot = GetFinalRenderedCamRot(2)
    local fov = GetFinalRenderedCamFov()
    local cam = CreateCamWithParams("DEFAULT_SCRIPTED_CAMERA", pos.x, pos.y, pos.z, rot.x, rot.y, rot.z, fov, false, 2)
    local camRight, camForward, camUp, camPos = GetCamMatrix(cam)

    DestroyCam(cam, true)

    screenPosition = vec2(screenPosition.x - 0.5, screenPosition.y - 0.5) * 2.0

    local fovRadians = (fov * 3.14) / 180.0
    local to = camPos + camForward + (camRight * screenPosition.x * fovRadians * GetAspectRatio(false) * 0.534375) - (camUp * screenPosition.y * fovRadians * 0.534375)

    local direction = (to - camPos) * maxDistance
    local endPoint = camPos + direction

    local rayHandle = StartExpensiveSynchronousShapeTestLosProbe(camPos.x, camPos.y, camPos.z, endPoint.x, endPoint.y, endPoint.z, -1, ignore, 0)
    local result, hit, endCoords, surfaceNormal, entityhit = GetShapeTestResult(rayHandle)

    return result, hit, endCoords, surfaceNormal, entityhit
end

local function updateNuiObjectList()
    local entityTable = {}

    for id, entity in pairs(Client.spawnedEntities) do
        table.insert(entityTable, entity)
    end

    table.sort(entityTable, function(a, b)
        return a.id < b.id
    end)

    SendNUIMessage({
        action = 'setObjectList',
        data = {
            entitiesList = entityTable
        }
    })
end

RegisterNUICallback('dolu_tool:selectEntity', function(_, cb)
    cb(1)

    if Client.currentTab ~= 'object' then
        return
    end

    local result, hit, endCoords, surfaceNormal, entityHit = raycast(10000.0, Client.gizmoEntity)

    repeat
        Wait(0)
    until result == 1 or result == 2

    if result == 1 or not hit or not entityHit then
        return
    end

    local entityType = GetEntityType(entityHit)
    local entityTypeName

    if entityType == 1 then
        if IsPedAPlayer(entityHit) then
            return
        end
        entityTypeName = 'ped'
    elseif entityType == 2 then
        entityTypeName = 'vehicle'
    elseif entityType == 3 then
        entityTypeName = 'object'
    else
        -- Todo: Handle other entity types?
        return
    end

    if entityType > 1 or not IsPedAPlayer(entityHit) then -- Make sure we are not trying to request control of a player
        if not NetworkHasControlOfEntity(entityHit) then
            NetworkRequestControlOfEntity(entityHit)

            local timer = GetGameTimer()
            while not NetworkHasControlOfEntity(entityHit) do
                Wait(0)

                if GetGameTimer() - timer > 5000 then
                    print('Failed to get control of object, please try again')

                    return lib.notify({
                        title = 'Dolu Tool',
                        description = 'Failed to get control of object, please try again',
                        type = 'error',
                        position = 'top'
                    })
                end
            end
        end
    end

    local modelName = GetEntityArchetypeName(entityHit) or ('%X'):format(GetEntityModel(entityHit)):upper()
    local entityCoords = GetEntityCoords(entityHit)
    local entityRotation = GetEntityRotation(entityHit)

    local entityId = Entity(entityHit).state.entityId
    local entity = entityId and Client.spawnedEntities[entityId]

    SendNUIMessage({
        action = 'setObjectData',
        data = { entity = entity or nil }
    })

    SendNUIMessage({
        action = 'setGizmoEntity',
        data = {
            id = entityId,
            name = modelName,
            hash = GetEntityModel(entityHit),
            handle = entityHit,
            position = entityCoords,
            rotation = entityRotation,
            type = entityTypeName
        }
    })

    Client.gizmoEntity = entityHit
end)

RegisterNUICallback('dolu_tool:addEntity', function(modelName, cb)
    cb(1)
    local model = joaat(modelName)

    if not IsModelInCdimage(model) then
        lib.notify({
            title = 'Dolu Tool',
            description = locale('entity_doesnt_exist'),
            type = 'error',
            position = 'top'
        })
        return
    end

    lib.requestModel(model)

    local distance = 5
    local cameraRotation = GetFinalRenderedCamRot(2)
    local cameraCoord = GetFinalRenderedCamCoord()
    local direction = rotationToDirection(cameraRotation)
    local coords = vec3(cameraCoord.x + direction.x * distance, cameraCoord.y + direction.y * distance, cameraCoord.z + direction.z * distance)
    local obj = CreateObjectNoOffset(model, coords.x, coords.y, coords.z, true, true, false)
    local entityId = generateUniqueId()

    Entity(obj).state:set('entityId', entityId, false)

    if not DoesEntityExist(obj) then
        return lib.notify({
            title = 'Dolu Tool',
            description = locale('entity_cant_be_loaded'),
            type = 'error',
            position = 'top'
        })
    end

    DisableCamCollisionForEntity(obj)

    local entityRotation = GetEntityRotation(obj)

    Client.spawnedEntities[entityId] = {
        id = entityId,
        handle = obj,
        name = modelName,
        position = {
            x = Utils.round(coords.x, 3),
            y = Utils.round(coords.y, 3),
            z = Utils.round(coords.z, 3)
        },
        rotation = {
            x = Utils.round(entityRotation.x, 3),
            y = Utils.round(entityRotation.y, 3),
            z = Utils.round(entityRotation.z, 3)
        },
        invalid = false
    }

    local entityData = {
        id = entityId,
        name = modelName,
        hash = GetHashKey(modelName),
        handle = obj,
        position = GetEntityCoords(obj),
        rotation = entityRotation,
    }

    SendNUIMessage({
        action = 'setGizmoEntity',
        data = entityData
    })

    SendNUIMessage({
        action = 'setObjectData',
        data = {
            entity = entityData
        }
    })

    Client.gizmoEntity = obj
    updateNuiObjectList()
end)

RegisterNUICallback('dolu_tool:gizmoDragStart', function(data, cb)
    cb(1)

    -- If SHIFT is pressed, duplicate the current gizmo entity
    if data.shiftPressed and Client.gizmoEntity and DoesEntityExist(Client.gizmoEntity) then
        local entityState = Entity(Client.gizmoEntity).state
        local entityId = entityState.entityId
        local originalEntity = entityId and Client.spawnedEntities[entityId]

        if not originalEntity then
            -- Entity not in spawned list, can't duplicate
            return
        end

        local model = joaat(originalEntity.name)

        if not IsModelInCdimage(model) then
            lib.notify({
                title = 'Dolu Tool',
                description = locale('entity_doesnt_exist'),
                type = 'error',
                position = 'top'
            })
            return
        end

        lib.requestModel(model)

        -- Create duplicate at current position
        local coords = vec3(data.position.x, data.position.y, data.position.z)
        local rotation = vec3(data.rotation.x, data.rotation.y, data.rotation.z)
        local obj = CreateObjectNoOffset(model, coords.x, coords.y, coords.z, true, true, false)
        local newEntityId = generateUniqueId()

        Entity(obj).state:set('entityId', newEntityId, false)

        if not DoesEntityExist(obj) then
            return lib.notify({
                title = 'Dolu Tool',
                description = locale('entity_cant_be_loaded'),
                type = 'error',
                position = 'top'
            })
        end

        DisableCamCollisionForEntity(obj)
        SetEntityRotation(obj, rotation.x, rotation.y, rotation.z, 2, false)

        local entityCoords = GetEntityCoords(obj)
        local entityRotation = GetEntityRotation(obj)

        -- Add to spawned entities list
        Client.spawnedEntities[newEntityId] = {
            id = newEntityId,
            handle = obj,
            name = originalEntity.name,
            position = {
                x = Utils.round(entityCoords.x, 3),
                y = Utils.round(entityCoords.y, 3),
                z = Utils.round(entityCoords.z, 3)
            },
            rotation = {
                x = Utils.round(entityRotation.x, 3),
                y = Utils.round(entityRotation.y, 3),
                z = Utils.round(entityRotation.z, 3)
            },
            invalid = false
        }

        -- Switch gizmo to control the new duplicate
        Client.gizmoEntity = obj

        local entityData = {
            id = newEntityId,
            name = originalEntity.name,
            hash = GetHashKey(originalEntity.name),
            handle = obj,
            position = entityCoords,
            rotation = entityRotation,
        }

        SendNUIMessage({
            action = 'setGizmoEntity',
            data = entityData
        })

        SendNUIMessage({
            action = 'setObjectData',
            data = {
                entity = entityData
            }
        })

        updateNuiObjectList()
    end
end)

RegisterNUICallback('dolu_tool:updateGizmoTransform', function(data, cb)
    cb(1)

    -- Apply transform to current gizmo entity
    -- Called every frame while dragging, so keep it minimal: the object list is synced once on drag end
    if Client.gizmoEntity and DoesEntityExist(Client.gizmoEntity) then
        if data.position then
            SetEntityCoordsNoOffset(Client.gizmoEntity, data.position.x, data.position.y, data.position.z, false, false, false)
        end

        if data.rotation then
            SetEntityRotation(Client.gizmoEntity, data.rotation.x, data.rotation.y, data.rotation.z, 0, false)
        end
    end
end)

RegisterNUICallback('dolu_tool:gizmoDragEnd', function(_, cb)
    local entity = Client.gizmoEntity

    if not entity or not DoesEntityExist(entity) then return cb(false) end

    -- If entity was spawned using Object Spawner, sync its final transform and return it to the NUI
    local entityId = Entity(entity).state.entityId
    local spawnedEntity = entityId and Client.spawnedEntities[entityId]

    if not spawnedEntity then return cb(false) end

    local coords = GetEntityCoords(entity)
    local rotation = GetEntityRotation(entity)

    spawnedEntity.position = {
        x = Utils.round(coords.x, 3),
        y = Utils.round(coords.y, 3),
        z = Utils.round(coords.z, 3)
    }
    spawnedEntity.rotation = {
        x = Utils.round(rotation.x, 3),
        y = Utils.round(rotation.y, 3),
        z = Utils.round(rotation.z, 3)
    }

    cb(spawnedEntity)
end)

RegisterNUICallback('dolu_tool:deleteEntity', function(entityId, cb)
    cb(1)

    local entity = Client.spawnedEntities[entityId]
    if not entity then
        lib.notify({
            title = 'Dolu Tool',
            description = locale('entity_doesnt_exist'),
            type = 'error',
            position = 'top'
        })
        return
    end

    if DoesEntityExist(entity.handle) then
        DeleteEntity(entity.handle)
    end
    Client.spawnedEntities[entityId] = nil

    SendNUIMessage({
        action = 'setGizmoEntity',
        data = {}
    })
    Client.gizmoEntity = nil

    updateNuiObjectList()

    lib.notify({
        title = 'Dolu Tool',
        description = locale('entity_deleted'),
        type = 'success',
        position = 'top'
    })
end)

RegisterNUICallback('dolu_tool:setEntityModel', function(data, cb)
    cb(1)
    local model = joaat(data.modelName)

    local entity = Client.spawnedEntities[data.entity.id]

    if not IsModelInCdimage(model) then
        data.entity.invalid = true

        -- Disable gizmo for invalid entity
        if Client.gizmoEntity == entity.handle then
            SendNUIMessage({
                action = 'setGizmoEntity',
                data = {}
            })
            Client.gizmoEntity = nil
        end

        SendNUIMessage({
            action = 'setObjectData',
            data = {
                entity = data.entity
            }
        })

        return
    end

    if entity and DoesEntityExist(entity.handle) then
        entity.invalid = false
        entity.name = data.modelName
        entity.hash = GetHashKey(entity.modelName)

        local currentPos = GetEntityCoords(entity.handle)
        local currentRot = GetEntityRotation(entity.handle)

        SetEntityAsMissionEntity(entity.handle, true, true)
        DeleteEntity(entity.handle)

        lib.requestModel(model)

        local obj = CreateObjectNoOffset(model, currentPos.x, currentPos.y, currentPos.z, false, false, false)
        SetEntityRotation(obj, currentRot.x, currentRot.y, currentRot.z, 2, false)

        entity.handle = obj
        entity.position = { x = currentPos.x, y = currentPos.y, z = currentPos.z }
        entity.rotation = { x = currentRot.x, y = currentRot.y, z = currentRot.z }

        Entity(obj).state:set('entityId', entity.id, false)

        SetModelAsNoLongerNeeded(model)

        SendNUIMessage({
            action = 'setObjectData',
            data = {
                entity = entity
            }
        })

        -- Reactivate gizmo with new entity
        SendNUIMessage({
            action = 'setGizmoEntity',
            data = {
                id = entity.id,
                name = entity.name,
                hash = entity.hash,
                handle = obj,
                position = GetEntityCoords(obj),
                rotation = GetEntityRotation(obj),
            }
        })

        Client.gizmoEntity = obj
    end
end)

RegisterNUICallback('dolu_tool:deleteAllEntities', function(_, cb)
    cb(1)

    -- Sending empty object to hide editor
    SendNUIMessage({
        action = 'setGizmoEntity',
        data = {}
    })

    Client.gizmoEntity = nil

    -- Remove all spawned entities
    local entities = Client.spawnedEntities

    for id, entity in pairs(entities) do
        if DoesEntityExist(entity.handle) then
            DeleteEntity(entity.handle)
        end
    end

    Client.spawnedEntities = {}

    -- Updating nui object list
    updateNuiObjectList()
end)

RegisterNUICallback('dolu_tool:setGizmoEntity', function(entityId, cb)
    cb(1)

    if not entityId then
        SendNUIMessage({
            action = 'setGizmoEntity',
            data = {}
        })
        Client.gizmoEntity = nil
        return
    end

    local entity = Client.spawnedEntities[entityId]

    if not entity or not DoesEntityExist(entity.handle) then
        return lib.notify({
            title = 'Dolu Tool',
            description = locale('entity_doesnt_exist'),
            type = 'error',
            position = 'top'
        })
    end

    SendNUIMessage({
        action = 'setGizmoEntity',
        data = {
            id = entity.id,
            name = entity.name,
            hash = GetHashKey(entity.name),
            handle = entity.handle,
            position = GetEntityCoords(entity.handle),
            rotation = GetEntityRotation(entity.handle),
        }
    })

    Client.gizmoEntity = entity.handle
end)

RegisterNUICallback('dolu_tool:goToEntity', function(data, cb)
    cb(1)

    if data?.position and data.handle and DoesEntityExist(data.handle) then
        local coords = GetEntityCoords(data.handle)

        Utils.teleportPlayer(coords, true)

        lib.notify({
            title = 'Dolu Tool',
            description = locale('teleport_success'),
            type = 'success',
            position = 'top'
        })
    else
        lib.notify({
            title = 'Dolu Tool',
            description = locale('entity_doesnt_exist'),
            type = 'error',
            position = 'top'
        })
    end
end)

RegisterNUICallback('dolu_tool:moveEntity', function(data, cb)
    cb(1)

    if not data.handle or not DoesEntityExist(data.handle) then
        return lib.notify({
            title = 'Dolu Tool',
            description = locale('entity_doesnt_exist'),
            type = 'error',
            position = 'top'
        })
    end

    if data.position then
        SetEntityCoordsNoOffset(data.handle, data.position.x, data.position.y, data.position.z, false, false, false)
    end

    if data.rotation then
        SetEntityRotation(data.handle, data.rotation.x, data.rotation.y, data.rotation.z, 0, false)
    end

    data.name = data.name or GetEntityArchetypeName(data.handle) or ('%X'):format(GetEntityModel(data.handle)):upper()
    data.hash = data.hash or GetEntityModel(data.handle)

    SendNUIMessage({
        action = 'setGizmoEntity',
        data = data
    })

    -- If entity was spawned using Object Spawner, send updated data to nui
    local spawnedEntity = Client.spawnedEntities[data.id]

    if spawnedEntity then
        spawnedEntity.position = GetEntityCoords(data.handle)
        spawnedEntity.rotation = GetEntityRotation(data.handle)

        SendNUIMessage({
            action = 'setObjectData',
            data = {
                entity = spawnedEntity
            }
        })
    end
end)

RegisterNUICallback('dolu_tool:snapEntityToGround', function(data, cb)
    cb(1)

    if not data.handle or not DoesEntityExist(data.handle) then
        return lib.notify({
            title = 'Dolu Tool',
            description = locale('entity_doesnt_exist'),
            type = 'error',
            position = 'top'
        })
    end

    PlaceObjectOnGroundProperly(data.handle)

    data.position = GetEntityCoords(data.handle)
    data.rotation = GetEntityRotation(data.handle)
    data.name = data.name or GetEntityArchetypeName(data.handle) or ('%X'):format(GetEntityModel(data.handle)):upper()
    data.hash = data.hash or GetEntityModel(data.handle)

    SendNUIMessage({
        action = 'setGizmoEntity',
        data = data
    })
    Client.gizmoEntity = data.handle

    -- If entity was spawned using Object Spawner, send updated data to nui
    if Client.spawnedEntities[data.handle] then
        SendNUIMessage({
            action = 'setObjectData',
            data = {
                entity = data
            }
        })
    end
end)

-- Gizmo's entity
CreateThread(function()
    SetEntityDrawOutlineShader(1)
    SetEntityDrawOutlineColor(130, 150, 250, 180)

    local previousGizmoEntity = nil

    while true do
        if Client.gizmoEntity then
            -- If gizmo entity changed, unfreeze the previous one
            if previousGizmoEntity and previousGizmoEntity ~= Client.gizmoEntity and DoesEntityExist(previousGizmoEntity) then
                FreezeEntityPosition(previousGizmoEntity, false)
            end

            -- Freeze the current gizmo entity
            if DoesEntityExist(Client.gizmoEntity) then
                FreezeEntityPosition(Client.gizmoEntity, true)
            end

            previousGizmoEntity = Client.gizmoEntity

            SendNUIMessage({
                action = 'setCameraPosition',
                data = {
                    position = GetFinalRenderedCamCoord(),
                    rotation = GetFinalRenderedCamRot(2)
                }
            })

            if Client.outlinedEntity then
                SetEntityDrawOutline(Client.outlinedEntity, false)
            end

            if GetEntityType(Client.gizmoEntity) ~= 1 then
                Client.outlinedEntity = Client.gizmoEntity
                SetEntityDrawOutline(Client.outlinedEntity, true)
            end
        else
            -- Unfreeze the previous entity when gizmo is disabled
            if previousGizmoEntity and DoesEntityExist(previousGizmoEntity) then
                FreezeEntityPosition(previousGizmoEntity, false)
                previousGizmoEntity = nil
            end

            if Client.outlinedEntity then
                SetEntityDrawOutline(Client.outlinedEntity, false)
                Client.outlinedEntity = nil
            end
            Wait(250)
        end
        Wait(0)
    end
end)

-- Exports
exports("setGizmoEntity", function(obj)
    if not DoesEntityExist(obj) then
        return lib.notify({
            description = locale('entity_doesnt_exist'),
            type = 'error',
            position = 'top'
        })
    end
    Client.gizmoEntity = obj
    local model = GetEntityModel(obj)

    SendNUIMessage({
        action = 'setGizmoEntity',
        data = {
            name = GetEntityArchetypeName(obj) or ('%X'):format(model):upper(),
            hash = model,
            handle = obj,
            position = GetEntityCoords(obj),
            rotation = GetEntityRotation(obj),
        }
    })

    SetNuiFocus(true, true)
    SetNuiFocusKeepInput(true)
end)

exports("removeGizmoEntity", function()
    SendNUIMessage({
        action = 'setGizmoEntity',
        data = {}
    })

    Client.gizmoEntity = nil
    SetNuiFocus(false, false)
    SetNuiFocusKeepInput(false)
end)
