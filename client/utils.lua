Utils = {}
LastEntitySet = nil
local WEATHER_LIST = {
    [`CLEAR`] = 'clear',
    [`EXTRASUNNY`] = 'extrasunny',
    [`NEUTRAL`] = 'neutral',
    [`SMOG`] = 'smog',
    [`FOGGY`] = 'foggy',
    [`OVERCAST`] = 'overcast',
    [`CLOUDS`] = 'clouds',
    [`CLEARING`] = 'clearing',
    [`RAIN`] = 'rain',
    [`THUNDER`] = 'thunder',
    [`SNOW`] = 'snow',
    [`BLIZZARD`] = 'blizzard',
    [`SNOWLIGHT`] = 'snowlight',
    [`XMAS`] = 'xmas',
    [`HALLOWEEN`] = 'halloween'
}

Utils.openUI = function()
    local coords = GetEntityCoords(cache.ped)

    SendNUIMessage({
        action = 'setMenuVisible',
        data = {
            version = Client.version,
            lastLocation = Client.lastLocation,
            position = coords.x .. ', ' .. coords.y .. ', ' .. coords.z
        }
    })

    if Client.currentTab == 'home' then
        Utils.setMenuPlayerCoords()
    end

    SetNuiFocus(true, true)
    SetNuiFocusKeepInput(false)
    Client.isMenuOpen = true
end

Utils.round = function(num, decimals)
    local power = 10 ^ decimals

    return math.floor(num * power) / power
end

Utils.stringSplit = function(input, seperator)
    if seperator == nil then
        seperator = '%s'
    end

    local t, i = {}, 1

    for str in string.gmatch(input, '([^' .. seperator .. ']+)') do
        t[i] = str
        i = i + 1
    end

    return t
end

Utils.Lerp = function(a, b, t)
    return a + (b - a) * t
end

--- Builds the timecycle modifiers list from game natives at startup.
--- Avoids shipping a heavy json file and always matches the timecycles
--- actually loaded by the game. The variable count is exposed as a separate
--- field so the UI can display it discreetly next to each item.
---@return { label: string, value: string, varCount: number }[]
Utils.getTimecycleModifiers = function()
    local modifiers = {}
    local count = GetTimecycleModifierCount()

    for index = 0, count - 1 do
        local name = GetTimecycleModifierNameByIndex(index)

        if name then
            modifiers[#modifiers + 1] = {
                label = name,
                value = tostring(joaat(name)),
                varCount = GetTimecycleModifierVarCount(name)
            }
        end
    end

    table.sort(modifiers, function(a, b) return a.label < b.label end)

    return modifiers
end

Utils.setTimecycle = function(timecycle, roomId)
    if Client.interiorId ~= 0 then
        if not roomId then
            local roomHash = GetRoomKeyFromEntity(cache.ped)
            roomId = GetInteriorRoomIndexByHash(Client.interiorId, roomHash)
        end

        if not Client.defaultTimecycles[Client.interiorId] then
            Client.defaultTimecycles[Client.interiorId] = {}
        end

        if not Client.defaultTimecycles[Client.interiorId][roomId] then
            local currentTimecycle = GetInteriorRoomTimecycle(Client.interiorId, roomId)

            local found
            for _, v in pairs(Client.data.timecycles) do
                if v.value == tostring(currentTimecycle) then
                    found = v.label
                    break
                end
            end

            if not found then
                found = 'Unknown'
            end

            Client.defaultTimecycles[Client.interiorId][roomId] = {
                label = found,
                value = currentTimecycle
            }
        end

        SetInteriorRoomTimecycle(Client.interiorId, roomId, tonumber(timecycle))
        RefreshInterior(Client.interiorId)
    else
        SetTimecycleModifier(tonumber(timecycle))
    end
end

Utils.setPortalFlag = function(portal, flag)
    if Client.interiorId ~= 0 then
        local portalIndex = tonumber(portal)
        local newFlag = tonumber(flag)

        SetInteriorPortalFlag(Client.interiorId, portalIndex, newFlag)
        RefreshInterior(Client.interiorId)
    end
end

Utils.setRoomFlag = function(flag)
    local playerPed = cache.ped
    local roomHash = GetRoomKeyFromEntity(playerPed)
    local roomId = GetInteriorRoomIndexByHash(Client.interiorId, roomHash)

    if Client.interiorId ~= 0 and roomId ~= -1 then
        local newFlag = tonumber(flag)

        SetInteriorRoomFlag(Client.interiorId, roomId, newFlag)
        RefreshInterior(Client.interiorId)
    end
end

Utils.enableEntitySet = function(value)
    if IsInteriorEntitySetActive(Client.interiorId, value) then
        DeactivateInteriorEntitySet(Client.interiorId, value)
        LastEntitySet = value
    else
        ActivateInteriorEntitySet(Client.interiorId, value)
        LastEntitySet = value
    end

    RefreshInterior(Client.interiorId)
end

Utils.toggleLastEntitySet = function()
    if LastEntitySet ~= nil then
        if IsInteriorEntitySetActive(Client.interiorId, LastEntitySet) then
            DeactivateInteriorEntitySet(Client.interiorId, tostring(LastEntitySet))
            RefreshInterior(Client.interiorId)
        else
            ActivateInteriorEntitySet(Client.interiorId, tostring(LastEntitySet))
            RefreshInterior(Client.interiorId)
        end
    end
end

Utils.getClock = function()
    return GetClockHours(), GetClockMinutes(), GetClockSeconds()
end

Utils.setClock = function(hour, minutes, seconds)
    hour = tonumber(hour)
    minutes = tonumber(minutes)
    seconds = tonumber(seconds)

    NetworkOverrideClockTime(hour, minutes, seconds)
end

Utils.getWeather = function()
    local weatherType1, weatherType2, percentWeather2 = GetWeatherTypeTransition()
    local currentWeather = percentWeather2 > 0.5 and weatherType2 or weatherType1

    return WEATHER_LIST[currentWeather]
end

Utils.setWeather = function(weather)
    local found

    for hash, v in pairs(WEATHER_LIST) do
        if v == weather:lower() then
            found = hash
            break
        end
    end

    if not WEATHER_LIST[found] then
        error(locale('command_weather_notfound', tostring(weather)))
    end

    SetWeatherTypeNowPersist(weather)
    SetWeatherTypePersist(weather)
end

Utils.QMultiply = function(a, b)
    local axx = a.x * 2
    local ayy = a.y * 2
    local azz = a.z * 2
    local awxx = a.w * axx
    local awyy = a.w * ayy
    local awzz = a.w * azz
    local axxx = a.x * axx
    local axyy = a.x * ayy
    local axzz = a.x * azz
    local ayyy = a.y * ayy
    local ayzz = a.y * azz
    local azzz = a.z * azz

    return vec3(((b.x * ((1.0 - ayyy) - azzz)) + (b.y * (axyy - awzz))) + (b.z * (axzz + awyy)),
        ((b.x * (axyy + awzz)) + (b.y * ((1.0 - axxx) - azzz))) + (b.z * (ayzz - awxx)),
        ((b.x * (axzz - awyy)) + (b.y * (ayzz + awxx))) + (b.z * ((1.0 - axxx) - ayyy)))
end

Utils.Draw3DText = function(DrawCoords, text)
    local onScreen, _x, _y = GetScreenCoordFromWorldCoord(DrawCoords.x, DrawCoords.y, DrawCoords.z)
    local px, py, pz = table.unpack(GetFinalRenderedCamCoord())
    local dist = #(vec3(px, py, pz) - vec3(DrawCoords.x, DrawCoords.y, DrawCoords.z))
    local fov = (1 / GetGameplayCamFov()) * 100
    local scale = (1 / dist) * fov

    if onScreen then
        SetTextScale(0.0 * scale, 1.1 * scale)
        SetTextFont(0)
        SetTextProportional(1)
        SetTextDropshadow(0, 0, 0, 0, 255)
        SetTextEdge(2, 0, 0, 0, 150)
        SetTextDropShadow()
        SetTextOutline()
        BeginTextCommandDisplayText('STRING')
        SetTextCentre(1)
        AddTextComponentSubstringPlayerName(text)
        EndTextCommandDisplayText(_x, _y)
    end
end

Utils.DrawFloating = function(DrawCoords, text)
    BeginTextCommandDisplayHelp('FloatingNotification')
    AddTextEntry('FloatingNotification', text)
    EndTextCommandDisplayHelp(2, false, false, -1)
    SetFloatingHelpTextWorldPosition(1, DrawCoords.x, DrawCoords.y, DrawCoords.z + 0.1)
    SetFloatingHelpTextStyle(1, 1, 2, -1, 3, 0)
end

Utils.drawText = function(string, coords)
    SetTextFont(0)
    SetTextProportional(1)
    SetTextScale(0.36, 0.36)
    SetTextColour(255, 255, 255, 255)
    SetTextDropshadow(0, 0, 0, 0, 255)
    SetTextEdge(5, 0, 0, 0, 255)
    SetTextDropShadow()
    SetTextOutline()
    SetTextRightJustify(false)
    SetTextWrap(0, 0.55)
    SetTextEntry('STRING')

    AddTextComponentString(string)
    DrawText(coords.x, coords.y)
end

-- Teleport functions (thanks to ox_core)
Utils.freezePlayer = function(state, vehicle)
    local playerId, ped = cache.playerId, cache.ped
    local entity = vehicle and cache.vehicle or ped

    SetPlayerControl(playerId, not state, 1 << 8)
    SetPlayerInvincible(playerId, state)
    FreezeEntityPosition(entity, state)
    SetEntityCollision(entity, not state, vehicle)

    if not state and vehicle then
        SetVehicleOnGroundProperly(entity)
    end
end

Utils.setPlayerCoords = function(x, y, z, heading, withVehicle)
    local entity = withVehicle and cache.seat == -1 and cache.vehicle or cache.ped

    SetEntityCoordsNoOffset(entity, x, y, z, false, false, false)

    if heading then
        SetEntityHeading(entity, heading)
    end
end

Utils.setMenuPlayerCoords = function()
    local coords = GetEntityCoords(cache.ped)
    local heading = GetEntityHeading(cache.ped)

    if Client.noClip then
        coords = GetFinalRenderedCamCoord()
        heading = GetFinalRenderedCamRot(2).z % 360
    end

    SendNUIMessage({
        action = 'playerCoords',
        data = {
            coords = Utils.round(coords.x, 3) .. ', ' .. Utils.round(coords.y, 3) .. ', ' .. Utils.round(coords.z, 3),
            heading = tostring(Utils.round(heading, 3))
        }
    })

    return coords, heading
end

Utils.teleportPlayer = function(coords, updateLastCoords)
    coords = vec4(coords.x, coords.y, coords.z, coords.w or coords.heading or 0)

    if Client.noClip then
        if updateLastCoords then
            local lastCoords = GetEntityCoords(cache.ped)
            Client.lastCoords = vec4(lastCoords.x, lastCoords.y, lastCoords.z, GetEntityHeading(cache.ped))
        end

        SetGameplayCamCoords(vec3(coords.x, coords.y, coords.z + 0.5))
        return
    end

    DoScreenFadeOut(150)

    while not IsScreenFadedOut() do
        Wait(0)
    end

    local isDriving = cache.seat == -1
    local entity = isDriving and cache.vehicle or cache.ped

    if updateLastCoords then
        local lastCoords = GetEntityCoords(entity)
        Client.lastCoords = vec4(lastCoords.x, lastCoords.y, lastCoords.z, GetEntityHeading(entity))
    end

    RequestCollisionAtCoord(coords.x, coords.y, coords.z)
    Utils.freezePlayer(true, true)
    SetEntityCoordsNoOffset(entity, coords.x, coords.y, coords.z, false, false, false)
    SetEntityHeading(entity, coords.w or 0)
    SetGameplayCamRelativeHeading(0)

    Wait(500)

    DoScreenFadeIn(250)
    Utils.freezePlayer(false, isDriving)

    GetInteriorData()
end

Utils.changePed = function(model)
    if type(model) == 'string' then model = joaat(model) end

    if not IsModelInCdimage(model) then
        lib.notify({ type = 'error', description = locale('model_doesnt_exist', model) })
        return
    end

    local playerId = cache.playerId

    lib.requestModel(model)
    SetPlayerModel(playerId, model)
    cache.ped = PlayerPedId()
end

Utils.spawnVehicle = function(model, coords)
    if type(model) == 'string' then model = joaat(model) end

    local playerPed = cache.ped
    local oldVehicle = GetVehiclePedIsIn(playerPed, false)

    if oldVehicle > 0 and GetPedInVehicleSeat(oldVehicle, -1) == playerPed then
        DeleteVehicle(oldVehicle)
    end

    if not coords then
        coords = GetEntityCoords(playerPed)
    end

    lib.requestModel(model)

    local vehicle = CreateVehicle(model, coords.x, coords.y, coords.z, GetEntityHeading(playerPed), true, true)

    TaskWarpPedIntoVehicle(playerPed, vehicle, -1)
    SetVehRadioStation(vehicle, 'OFF')
    SetVehicleDirtLevel(vehicle, 0.0)

    if Config.customVehiclePlate and Config.customVehiclePlate ~= '' then
        SetVehicleNumberPlateText(vehicle, Config.customVehiclePlate)
    end

    cache.vehicle = vehicle
end

Utils.listFlags = function(totalFlags, type)
    local all_flags = {
        portal = { 1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192 },
        room = { 1, 2, 4, 8, 16, 32, 64, 128, 256, 512 }
    }

    if not all_flags[type] then return end

    local flags = {}

    for _, flag in ipairs(all_flags[type]) do
        if totalFlags & flag ~= 0 then
            flags[#flags + 1] = tostring(flag)
        end
    end

    local result = {}

    for i, flag in ipairs(flags) do
        result[#result + 1] = tostring(flag)
    end

    return result
end

Utils.quat2Euler = function(x, y, z, w)
    local q0 = w
    local q1 = x
    local q2 = y
    local q3 = z

    local Rx = math.atan2(2 * (q0 * q1 + q2 * q3), 1 - (2 * (q1 * q1 + q2 * q2)))
    local Ry = math.asin(2 * (q0 * q2 - q3 * q1))
    local Rz = math.atan2(2 * (q0 * q3 + q1 * q2), 1 - (2 * (q2 * q2 + q3 * q3)))

    local euler = vec3(Rx, Ry, Rz) * 180 / math.pi

    return euler
end

Utils.rotationToDirection = function(rotation)
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

Utils.initTarget = function()
    if Config.usePermission and not lib.callback.await('dolu_tool:isAllowed', 100, true) then return end

    exports.ox_target:addGlobalObject({
        {
            name = 'ox:option0',
            icon = 'fa-solid fa-clipboard-list',
            label = 'Copy model hash',
            distance = 10,
            onSelect = function(data)
                local model = GetEntityModel(data.entity)
                lib.setClipboard(model)
                lib.notify({ type = 'success', description = locale('copied_model_clipboard') })
            end
        },
        {
            name = 'ox:option1',
            icon = 'fa-solid fa-clipboard-list',
            label = 'Copy coords',
            distance = 10,
            onSelect = function(data)
                local coords = GetEntityCoords(data.entity)
                lib.setClipboard(coords.x .. ', ' .. coords.y .. ', ' .. coords.z)
                lib.notify({ type = 'success', description = locale('copied_coords_clipboard') })
            end
        },
        {
            name = 'ox:option2',
            icon = 'fa-solid fa-maximize',
            label = 'Move object',
            distance = 10,
            canInteract = function()
                return Client.gizmoEntity == nil
            end,
            onSelect = function(data)
                SendNUIMessage({
                    action = 'setGizmoEntity',
                    data = {
                        name = 'Unknown Game Object',
                        hash = 0,
                        handle = data.entity,
                        position = GetEntityCoords(data.entity),
                        rotation = GetEntityRotation(data.entity),
                    }
                })
                Client.gizmoEntity = data.entity
                SetNuiFocus(true, true)
                SetNuiFocusKeepInput(false)
                lib.notify({ type = 'inform', description = locale('press_escape_exit') })
            end
        },
        {
            name = 'ox:option4',
            icon = 'fa-solid fa-down-long',
            label = 'Snap to ground',
            distance = 10,
            onSelect = function(data)
                PlaceObjectOnGroundProperly(data.entity)
            end
        },
        {
            name = 'ox:option5',
            icon = 'fa-solid fa-trash',
            label = 'Delete entity',
            distance = 10,
            onSelect = function(data)
                SetEntityAsMissionEntity(data.entity)
                DeleteEntity(data.entity)
            end
        }
    })
end

Utils.getPages = function(page, table, itemPerPage)
    local start = (page - 1) * itemPerPage + 1 -- start index of the page
    local finish = start + itemPerPage - 1     -- end index of the page
    local pageContent = {}

    for i = start, math.min(finish, #table) do
        pageContent[#pageContent + 1] = table[i]
    end

    return pageContent
end

Utils.loadPage = function(listType, activePage, filter, checkboxes)
    local totalList = Client.data[listType]
    local filteredList = {}
    local itemPerPage = 6

    if listType == 'locations' then
        itemPerPage = 5
        if not checkboxes then
            checkboxes = Client.locationsCheckboxes
        end
    end

    -- Filter list from search input
    if filter and filter ~= '' or checkboxes ~= nil then
        local searchResult = {}

        Client.locationsCheckboxes = checkboxes

        if listType == 'locations' then
            for i, value in pairs(totalList) do
                if (value.custom and checkboxes.custom) or (not value.custom and checkboxes.vanilla) then
                    if (not filter or filter == '') or string.find(string.lower(value.name), string.lower(filter)) then
                        table.insert(searchResult, value)
                    end
                end
            end
        else
            for i, value in ipairs(totalList) do
                if string.find(string.lower(value.name), string.lower(filter)) ~= nil then
                    table.insert(searchResult, value)
                end
            end
        end
        filteredList = searchResult
    else
        filteredList = totalList
    end

    SendNUIMessage({
        action = 'setPageContent',
        data = {
            type = listType,
            content = Utils.getPages(activePage, filteredList, itemPerPage),
            maxPages = math.ceil(#filteredList / itemPerPage)
        }
    })
end

Utils.getClosestStaticEmitter = function()
    local closestEmitter = nil
    local closestDistance = 9999999

    for _, emitter in ipairs(Client.data.staticEmitters) do
        local distance = #(GetEntityCoords(cache.ped) - emitter.coords)

        if distance < closestDistance then
            closestDistance = math.floor(distance, 3)
            closestEmitter = emitter
        end
    end

    SendNUIMessage({
        action = 'setClosestEmitter',
        data = {
            distance = closestDistance,
            coords = math.floor(closestEmitter.coords.x, 3) .. ', ' .. math.floor(closestEmitter.coords.y, 3) .. ', ' .. math.floor(closestEmitter.coords.z, 3),
            name = closestEmitter.name,
            flags = closestEmitter.flags,
            interior = closestEmitter.interior,
            room = closestEmitter.room,
            radiostation = closestEmitter.radiostation
        }
    })
end

---Assert with styling and formatting
---@param v any
---@param msg string
---@param value boolean|string|number|table
Utils.assert = function(v, msg, value)
    if not v or not msg then return end

    if value then
        if type(value) == 'table' then
            value = json.decode(value, { indent = true })
        end
        assert(v, '^5[' .. cache.resource .. '] ^1' .. msg:format('^5' .. tostring(value) .. '^7'))
        lib.notify({
            title = 'Dolu Tool',
            description = msg:format(tostring(value)),
            type = 'error',
            position = 'top'
        })
    else
        assert(v, '^5[' .. cache.resource .. '] ^1' .. msg .. '^7')

        lib.notify({
            title = 'Dolu Tool',
            description = msg,
            type = 'error',
            position = 'top'
        })
    end
end

Utils.raycast = function(maxDistance, ignore)
    local screenPosition = { x = GetControlNormal(0, 239), y = GetControlNormal(0, 240) }
    local pos = GetFinalRenderedCamCoord()
    local rot = GetFinalRenderedCamRot(2)
    local fov = GetFinalRenderedCamFov()
    local cam = CreateCamWithParams("DEFAULT_SCRIPTED_CAMERA", pos.x, pos.y, pos.z, rot.x, rot.y, rot.z, fov, 0, 2)
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

Utils.resetGizmoEntity = function()
    SendNUIMessage({
        action = 'setGizmoEntity',
        data = {}
    })

    if DoesEntityExist(Client.gizmoEntity) then
        FreezeEntityPosition(Client.gizmoEntity, false)
    end

    Client.gizmoEntity = nil
end
