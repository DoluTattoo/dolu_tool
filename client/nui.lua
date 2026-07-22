local idCounter = 0

local function generateUniqueId()
    idCounter += 1
    return string.format("%x-%x", GetGameTimer(), idCounter)
end

RegisterNUICallback('dolu_tool:tabSelected', function(newTab, cb)
    cb(1)
    local previousTab = Client.currentTab

    Client.currentTab = newTab

    -- If exiting object tab while gizmo is enabled, set gizmo disabled
    if previousTab == 'object' and newTab ~= 'object' then
        SendNUIMessage({
            action = 'setGizmoEntity',
            data = {}
        })

        Client.gizmoEntity = nil
    end

    if newTab == 'home' then
        Utils.setMenuPlayerCoords()
    elseif newTab == 'world' then
        local hour, minute = Utils.getClock()

        SendNUIMessage({
            action = 'setWorldData',
            data = {
                clock = { hour = hour, minute = minute },
                weather = Utils.getWeather()
            }
        })
    elseif newTab == 'interior' and not Client.timecyclesLoaded then
        SendNUIMessage({
            action = 'setTimecycleList',
            data = Client.data.timecycles
        })
        Client.timecyclesLoaded = true
    elseif newTab == 'locations' and not Client.locationsLoaded then
        Utils.loadPage('locations', 1)
        Client.locationsLoaded = true
    elseif newTab == 'peds' and not Client.pedsLoaded then
        Utils.loadPage('peds', 1)
        Client.pedsLoaded = true
    elseif newTab == 'vehicles' and not Client.vehiclesLoaded then
        Utils.loadPage('vehicles', 1)
        Client.vehiclesLoaded = true
    elseif newTab == 'weapons' and not Client.weaponsLoaded then
        Utils.loadPage('weapons', 1)
        Client.weaponsLoaded = true
    elseif newTab == 'audio' and not Client.audioLoaded then
        Utils.getClosestStaticEmitter()

        SendNUIMessage({
            action = 'setRadioStationsList',
            data = Client.data.radioStations
        })

        Client.audioLoaded = true
    end
end)

RegisterNUICallback('dolu_tool:teleport', function(data, cb)
    cb(1)
    if data then
        Utils.teleportPlayer(data, true)

        SendNUIMessage({
            action = 'setLastLocation',
            data = data
        })

        SetResourceKvp('dolu_tool:lastLocation', json.encode(data))
        Client.lastLocation = data
    end
end)

RegisterNUICallback('dolu_tool:changePed', function(data, cb)
    cb(1)
    Utils.changePed(data.name)
end)

RegisterNUICallback('dolu_tool:spawnVehicle', function(data, cb)
    cb(1)
    Utils.spawnVehicle(data)
end)

RegisterNUICallback('dolu_tool:deleteVehicle', function(_, cb)
    cb(1)
    if cache.vehicle and DoesEntityExist(cache.vehicle) then
        DeleteVehicle(cache.vehicle)
    end
end)

RegisterNUICallback('dolu_tool:exit', function(_, cb)
    cb(1)
    SetNuiFocus(false, false)
    SetNuiFocusKeepInput(false)

    SendNUIMessage({
        action = 'setGizmoEntity',
        data = {}
    })
    Client.gizmoEntity = nil
    Client.isMenuOpen = false
end)

RegisterNUICallback('dolu_tool:changeLocationName', function(data, cb)
    cb(1)
    lib.callback('dolu_tool:renameLocation', false, function(result)
        if not result then return end

        Client.data.locations[result.index] = result.data

        if Client.isMenuOpen and Client.currentTab == 'locations' then
            Utils.loadPage('locations', 1)
        end
    end, data)
end)

RegisterNUICallback('dolu_tool:createCustomLocation', function(locationName, cb)
    cb(1)
    local playerPed = cache.ped

    lib.callback('dolu_tool:createCustomLocation', false, function(result)
        if not result then return end

        -- Insert new location at index 1
        table.insert(Client.data.locations, 1, result)

        if Client.isMenuOpen and Client.currentTab == 'locations' then
            Utils.loadPage('locations', 1)
        end

        lib.notify({
            title = 'Dolu Tool',
            description = locale('custom_location_created'),
            type = 'success',
            position = 'top'
        })
    end, {
        name = locationName,
        coords = GetEntityCoords(playerPed),
        heading = GetEntityHeading(playerPed)
    })
end)

RegisterNUICallback('dolu_tool:deleteLocation', function(locationName, cb)
    cb(1)
    local result = lib.callback.await('dolu_tool:deleteLocation', false, locationName)

    if not result then return end

    -- Remove location from file
    table.remove(Client.data.locations, result)

    if Client.isMenuOpen and Client.currentTab == 'locations' then
        Utils.loadPage('locations', 1)
    end
end)

RegisterNUICallback('dolu_tool:setWeather', function(weatherName, cb)
    cb(1)
    Utils.setWeather(weatherName)
end)

RegisterNUICallback('dolu_tool:setClock', function(clock, cb)
    cb(1)
    Utils.setClock(clock.hour, clock.minute)
end)

RegisterNUICallback('dolu_tool:getClock', function(_, cb)
    cb(1)
    local hour, minute = Utils.getClock()

    SendNUIMessage({
        action = 'setClockData',
        data = { hour = hour, minute = minute }
    })
end)

RegisterNUICallback('dolu_tool:freezeTime', function(state, cb)
    cb(1)
    Client.freezeTime = state
end)

RegisterNUICallback('dolu_tool:freezeWeather', function(state, cb)
    cb(1)
    Client.freezeWeather = state
end)

RegisterNUICallback('dolu_tool:cleanZone', function(_, cb)
    cb(1)
    local playerId = cache.ped
    local playerCoords = GetEntityCoords(playerId)

    ClearAreaOfEverything(playerCoords.x, playerCoords.y, playerCoords.z, 1000.0, false, false, false, false)
end)

RegisterNUICallback('dolu_tool:cleanPed', function(_, cb)
    cb(1)
    local playerId = cache.ped

    ClearPedBloodDamage(playerId)
    ClearPedEnvDirt(playerId)
    ClearPedWetness(playerId)
end)

RegisterNUICallback('dolu_tool:upgradeVehicle', function(_, cb)
    cb(1)
    local vehicle = cache.vehicle

    if DoesEntityExist(vehicle) and IsEntityAVehicle(vehicle) then
        local max

        for _, modType in ipairs({ 11, 12, 13, 16 }) do
            max = GetNumVehicleMods(vehicle, modType) - 1
            SetVehicleMod(vehicle, modType, max, customWheels)
        end

        ToggleVehicleMod(vehicle, 18, true) -- Turbo

        lib.notify({
            title = 'Dolu Tool',
            description = locale('vehicle_upgraded'),
            type = 'success',
            position = 'top'
        })
    end
end)

RegisterNUICallback('dolu_tool:repairVehicle', function(_, cb)
    cb(1)
    local vehicle = cache.vehicle

    SetVehicleFixed(vehicle)
    SetVehicleEngineHealth(vehicle, 1000.0)
    SetVehicleDirtLevel(vehicle, 0.0)
end)

RegisterNUICallback('dolu_tool:giveWeapon', function(weaponName, cb)
    cb(1)
    if Shared.ox_inventory then
        lib.callback('dolu_tool:giveWeaponToPlayer', false, function(result)
            if result then
                lib.notify({ type = 'success', description = locale('weapon_gave') })
            else
                lib.notify({ type = 'error', description = locale('weapon_cant_carry') })
            end
        end, weaponName)

        return
    else
        GiveWeaponToPed(cache.ped, joaat(weaponName), 999, false, true)
    end
end)

RegisterNUICallback('dolu_tool:setDay', function(_, cb)
    cb(1)
    Utils.setClock(12)
    Utils.setWeather('extrasunny')
end)

RegisterNUICallback('dolu_tool:setMaxHealth', function(_, cb)
    cb(1)
    local playerPed = PlayerPedId()

    SetEntityHealth(playerPed, GetEntityMaxHealth(playerPed))

    lib.notify({
        title = 'Dolu Tool',
        description = locale('max_health_set'),
        type = 'success',
        position = 'top'
    })
end)

RegisterNUICallback('dolu_tool:spawnFavoriteVehicle', function(_, cb)
    cb(1)
    Utils.spawnVehicle(Config.favoriteVehicle)
end)

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

    local result, hit, endCoords, surfaceNormal, entityHit = Utils.raycast(10000.0, Client.gizmoEntity)

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
    local direction = Utils.rotationToDirection(cameraRotation)
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

RegisterNUICallback('dolu_tool:setCustomCoords', function(data, cb)
    cb(1)

    local formatedCoords

    if data.coordString then
        local coordString = (data.coordString:gsub(',', '')):gsub('  ', ' ')
        local coords = {}

        for match in (coordString .. ' '):gmatch('(.-) ') do
            table.insert(coords, match)
        end

        formatedCoords = vec3(tonumber(coords[1]), tonumber(coords[2]), tonumber(coords[3]))
    elseif data.coords then
        formatedCoords = vec3(data.coords.x, data.coords.y, data.coords.z)
    end

    if formatedCoords then
        Utils.teleportPlayer(formatedCoords, true)
    end
end)

RegisterNUICallback('dolu_tool:loadPages', function(data, cb)
    cb(1)
    Utils.loadPage(data.type, data.activePage, data.filter, data.checkboxes)
end)

RegisterNUICallback('dolu_tool:setStaticEmitterDrawDistance', function(distance, cb)
    cb(1)
    Client.staticEmitterDrawDistance = distance
end)

RegisterNUICallback('dolu_tool:getClosestStaticEmitter', function(_, cb)
    cb(1)
    Utils.getClosestStaticEmitter()
end)

RegisterNUICallback('dolu_tool:toggleStaticEmitter', function(data, cb)
    cb(1)
    SetStaticEmitterEnabled(data.emitterName, data.state)
end)

RegisterNUICallback('dolu_tool:setStaticEmitterRadio', function(data, cb)
    cb(1)
    SetEmitterRadioStation(data.emitterName, data.radioStation)

    for _, v in ipairs(Client.data.staticEmitters) do
        if v.name == data.emitterName then
            v.radiostation = data.radioStation
            break
        end
    end
end)

RegisterNUICallback('dolu_tool:setDrawStaticEmitters', function(state, cb)
    cb(1)
    Client.drawStaticEmitters = state
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
