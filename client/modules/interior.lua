-- Interior tab: rooms, portals, timecycles & flags

local function lerp(a, b, t)
    return a + (b - a) * t
end

local function qMultiply(a, b)
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

local function draw3DText(DrawCoords, text)
    local onScreen, _x, _y = GetScreenCoordFromWorldCoord(DrawCoords.x, DrawCoords.y, DrawCoords.z)
    local px, py, pz = table.unpack(GetFinalRenderedCamCoord())
    local dist = #(vec3(px, py, pz) - vec3(DrawCoords.x, DrawCoords.y, DrawCoords.z))
    local fov = (1 / GetGameplayCamFov()) * 100
    local scale = (1 / dist) * fov

    if onScreen then
        SetTextScale(0.0 * scale, 1.1 * scale)
        SetTextFont(0)
        SetTextProportional(true)
        SetTextDropshadow(0, 0, 0, 0, 255)
        SetTextEdge(2, 0, 0, 0, 150)
        SetTextDropShadow()
        SetTextOutline()
        BeginTextCommandDisplayText('STRING')
        SetTextCentre(true)
        AddTextComponentSubstringPlayerName(text)
        EndTextCommandDisplayText(_x, _y)
    end
end

local function listFlags(totalFlags, type)
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

local function setTimecycle(timecycle, roomId)
    local timecycleValue = tonumber(timecycle) or 0

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

        SetInteriorRoomTimecycle(Client.interiorId, roomId, timecycleValue)
        RefreshInterior(Client.interiorId)
    else
        SetTimecycleModifier(tostring(timecycleValue))
    end
end

-- Check for interior data
local lastRoomId = 0

function GetInteriorData(fromThread)
    local currentRoomHash = GetRoomKeyFromEntity(cache.ped)
    local currentRoomId = GetInteriorRoomIndexByHash(Client.interiorId, currentRoomHash)

    if (fromThread and lastRoomId ~= currentRoomId) or not fromThread then
        lastRoomId = currentRoomId
        local roomCount = GetInteriorRoomCount(Client.interiorId) - 1
        local portalCount = GetInteriorPortalCount(Client.interiorId)

        local rooms = {}

        for i = 1, roomCount do
            local totalFlags = GetInteriorRoomFlag(Client.interiorId, i)
            rooms[i] = {
                index = i,
                name = GetInteriorRoomName(Client.interiorId, i),
                timecycle = tostring(GetInteriorRoomTimecycle(Client.interiorId, i)),
                isCurrent = currentRoomId == i and true or nil,
                flags = {
                    list = listFlags(totalFlags, 'room'),
                    total = totalFlags
                }
            }
        end

        local portals = {}

        for i = 0, portalCount - 1 do
            local totalFlags = GetInteriorPortalFlag(Client.interiorId, i)
            portals[i] = {
                index = i,
                roomFrom = GetInteriorPortalRoomFrom(Client.interiorId, i),
                roomTo = GetInteriorPortalRoomTo(Client.interiorId, i),
                flags = {
                    list = listFlags(totalFlags, 'portal'),
                    total = totalFlags
                }
            }
        end

        -- Interior transform & bounds (only valid when actually inside an interior;
        -- calling these natives with an invalid interior id crashes the game)
        local position, rotation, extents
        if Client.interiorId and Client.interiorId ~= 0 then
            local posX, posY, posZ = GetInteriorPosition(Client.interiorId)
            local rotX, rotY, rotZ, rotW = GetInteriorRotation(Client.interiorId)
            local minX, minY, minZ, maxX, maxY, maxZ = GetInteriorEntitiesExtents(Client.interiorId)
            position = { x = posX, y = posY, z = posZ }
            rotation = { x = rotX, y = rotY, z = rotZ, w = rotW }
            extents = {
                min = { x = minX, y = minY, z = minZ },
                max = { x = maxX, y = maxY, z = maxZ }
            }
        end

        local intData = {
            interiorId = Client.interiorId,
            roomCount = roomCount,
            portalCount = portalCount,
            position = position,
            rotation = rotation,
            extents = extents,
            rooms = rooms,
            portals = portals,
            currentRoom = {
                index = currentRoomId > 0 and currentRoomId or 0,
                name = currentRoomId > 0 and rooms[currentRoomId].name or 'none',
                timecycle = currentRoomId > 0 and rooms[currentRoomId].timecycle or 0,
                flags = currentRoomId > 0 and rooms[currentRoomId].flags or {list = {}, total = 0},
            }
        }

        SendNUIMessage({
            action = 'setIntData',
            data = intData
        })

        Client.intData = intData
    else
        if Client.interiorId == 0 then
            SendNUIMessage({
                action = 'setIntData',
                data = { interiorId = 0 }
            })
        end
        Wait(200)
    end
end

Menu.onTabOpen('interior', function()
    if Client.timecyclesLoaded then return end

    SendNUIMessage({
        action = 'setTimecycleList',
        data = Client.data.timecycles
    })
    Client.timecyclesLoaded = true
end)

-- Portals display
RegisterNUICallback('dolu_tool:setPortalCheckbox', function(data, cb)
    local state = {}

    for _, v in pairs(data) do
        state[v] = true
    end

    Client.portalInfos = state.portalInfos
    Client.portalPoly = state.portalPoly
    Client.portalLines = state.portalLines
    Client.portalCorners = state.portalCorners

    cb(1)
end)

RegisterNUICallback('dolu_tool:setPortalFlagCheckbox', function(data, cb)
    local flag = 0

    for _, v in ipairs(data.flags) do
        flag += tonumber(v) or 0
    end

    SetInteriorPortalFlag(Client.interiorId, data.portalIndex, flag)
    Wait(10)
    RefreshInterior(Client.interiorId)

    -- Update flag back in nui
    GetInteriorData()

    cb(1)
end)

RegisterNUICallback('dolu_tool:setRoomFlagCheckbox', function(data, cb)
    local flag = 0

    for _, v in ipairs(data.flags) do
        flag += tonumber(v) or 0
    end

    local roomId = data.roomId
    if roomId == nil then
        roomId = GetInteriorRoomIndexByHash(Client.interiorId, GetRoomKeyFromEntity(cache.ped))
    end

    SetInteriorRoomFlag(Client.interiorId, roomId, flag)
    Wait(10)
    RefreshInterior(Client.interiorId)

    -- Update flag back in nui
    GetInteriorData()

    cb(1)
end)

RegisterNUICallback('dolu_tool:flipPortal', function(data, cb)
    local roomFrom = GetInteriorPortalRoomFrom(Client.interiorId, data.portalIndex)
    local roomTo = GetInteriorPortalRoomTo(Client.interiorId, data.portalIndex)

    SetInteriorPortalRoomFrom(Client.interiorId, data.portalIndex, roomTo)
    SetInteriorPortalRoomTo(Client.interiorId, data.portalIndex, roomFrom)

    RefreshInterior(Client.interiorId)

    Wait(50)
    GetInteriorData()

    cb(1)
end)

RegisterNUICallback('dolu_tool:setTimecycle', function(data, cb)
    cb(1)

    if data.roomId and Client.intData.currentRoom.timecycle ~= data.value then
        setTimecycle(data.value)
    end
end)

RegisterNUICallback('dolu_tool:resetTimecycle', function(data, cb)
    if data.roomId then
        if not Client.defaultTimecycles[Client.interiorId] then
            print('No default timecycle for interior ' .. Client.interiorId)
            cb(0)
        elseif not Client.defaultTimecycles[Client.interiorId][data.roomId] then
            print('No default timecycle for room ' .. data.roomId)
            cb(0)
        end

        setTimecycle(Client.defaultTimecycles[Client.interiorId][data.roomId].value)

        cb(Client.defaultTimecycles[Client.interiorId][data.roomId])
    end
end)

-- Update current interior id
CreateThread(function()
    while true do
        Wait(150)
        Client.interiorId = GetInteriorFromEntity(cache.ped)
    end
end)

-- Send interior data to NUI
CreateThread(function()
    Wait(500)
    GetInteriorData()

    while true do
        if Client.isMenuOpen then
            if Client.interiorId > 0 then
                GetInteriorData(true)
            else
                GetInteriorData()
                Wait(200)
            end
        else
            Wait(200)
        end
        Wait(0)
    end
end)

-- Draw interior portals
CreateThread(function()
    while true do
        if Client.interiorId > 0 then
            if Client.portalPoly or Client.portalLines or Client.portalCorners or Client.portalInfos then
                local ix, iy, iz = GetInteriorPosition(Client.interiorId)
                local rotX, rotY, rotZ, rotW = GetInteriorRotation(Client.interiorId)
                local interiorPosition = vec3(ix, iy, iz)
                local interiorRotation = quat(rotW, rotX, rotY, rotZ)
                local pedCoords = GetEntityCoords(cache.ped)

                for portalId = 0, GetInteriorPortalCount(Client.interiorId) - 1 do
                    local corners = {}
                    local pureCorners = {}

                    for cornerIndex = 0, 3 do
                        local cornerX, cornerY, cornerZ = GetInteriorPortalCornerPosition(Client.interiorId, portalId, cornerIndex)
                        local cornerPosition = interiorPosition + qMultiply(interiorRotation, vec3(cornerX, cornerY, cornerZ))

                        corners[cornerIndex] = cornerPosition
                        pureCorners[cornerIndex] = vec3(cornerX, cornerY, cornerZ)
                    end

                    local CrossVector = lerp(corners[0], corners[2], 0.5)

                    if #(pedCoords - CrossVector) <= 8.0 then
                        if Client.portalPoly then
                            DrawPoly(corners[0].x, corners[0].y, corners[0].z, corners[1].x, corners[1].y, corners[1].z, corners[2].x, corners[2].y, corners[2].z, 0, 0, 180, 150)
                            DrawPoly(corners[0].x, corners[0].y, corners[0].z, corners[2].x, corners[2].y, corners[2].z, corners[3].x, corners[3].y, corners[3].z, 0, 0, 180, 150)
                            DrawPoly(corners[3].x, corners[3].y, corners[3].z, corners[2].x, corners[2].y, corners[2].z, corners[1].x, corners[1].y, corners[1].z, 0, 0, 180, 150)
                            DrawPoly(corners[3].x, corners[3].y, corners[3].z, corners[1].x, corners[1].y, corners[1].z, corners[0].x, corners[0].y, corners[0].z, 0, 0, 180, 150)
                        end

                        if Client.portalLines then
                            -- Borders oultine
                            DrawLine(corners[0].x, corners[0].y, corners[0].z, corners[1].x, corners[1].y, corners[1].z, 0, 255, 0, 255)
                            DrawLine(corners[1].x, corners[1].y, corners[1].z, corners[2].x, corners[2].y, corners[2].z, 0, 255, 0, 255)
                            DrawLine(corners[2].x, corners[2].y, corners[2].z, corners[3].x, corners[3].y, corners[3].z, 0, 255, 0, 255)
                            DrawLine(corners[3].x, corners[3].y, corners[3].z, corners[0].x, corners[0].y, corners[0].z, 0, 255, 0, 255)

                            -- Middle lines
                            DrawLine(corners[0].x, corners[0].y, corners[0].z, corners[2].x, corners[2].y, corners[2].z, 0, 255, 0, 255)
                            DrawLine(corners[1].x, corners[1].y, corners[1].z, corners[3].x, corners[3].y, corners[3].z, 0, 255, 0, 255)
                        end

                        if Client.portalCorners then
                            draw3DText(corners[0], ('~b~C0:~w~ %s %s %s'):format(math.round(pureCorners[0].x, 2), math.round(pureCorners[0].y, 2), math.round(pureCorners[0].z, 2)))
                            draw3DText(corners[1], ('~b~C1:~w~ %s %s %s'):format(math.round(pureCorners[1].x, 2), math.round(pureCorners[1].y, 2), math.round(pureCorners[1].z, 2)))
                            draw3DText(corners[2], ('~b~C2:~w~ %s %s %s'):format(math.round(pureCorners[2].x, 2), math.round(pureCorners[2].y, 2), math.round(pureCorners[2].z, 2)))
                            draw3DText(corners[3], ('~b~C3:~w~ %s %s %s'):format(math.round(pureCorners[3].x, 2), math.round(pureCorners[3].y, 2), math.round(pureCorners[3].z, 2)))
                        end

                        if Client.portalInfos then
                            local portalFlags = GetInteriorPortalFlag(Client.interiorId, portalId)
                            local portalRoomTo = GetInteriorPortalRoomTo(Client.interiorId, portalId)
                            local portalRoomFrom = GetInteriorPortalRoomFrom(Client.interiorId, portalId)

                            draw3DText(vec3(CrossVector.x, CrossVector.y, CrossVector.z + 0.2), ('~b~Portal ~w~%s'):format(portalId))
                            draw3DText(vec3(CrossVector.x, CrossVector.y, CrossVector.z + 0.05), ('~b~From ~w~%s~b~ To ~w~%s'):format(portalRoomFrom, portalRoomTo))
                            draw3DText(vec3(CrossVector.x, CrossVector.y, CrossVector.z - 0.1), ('~b~Flags ~w~%s'):format(portalFlags))
                        end
                    end
                end
            end
        else
            Wait(200)
        end
        Wait(0)
    end
end)
