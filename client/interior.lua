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
                    list = Utils.listFlags(totalFlags, 'room'),
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
                    list = Utils.listFlags(totalFlags, 'portal'),
                    total = totalFlags
                }
            }
        end

        local intData = {
            interiorId = Client.interiorId,
            roomCount = roomCount,
            portalCount = portalCount,
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
        Wait(500)
    end
end

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
        flag += tonumber(v)
    end

    SetInteriorPortalFlag(Client.interiorId, data.portalIndex, flag)
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
RegisterNUICallback('dolu_tool:getInteriorPos', function(data, cb)
    local x, y, z = GetInteriorPosition(Client.interiorId)
    cb({ x = x, y = y, z = z })
end)

RegisterNUICallback('dolu_tool:setTimecycle', function(data, cb)
    cb(1)

    if data.roomId and Client.intData.currentRoom.timecycle ~= data.value then
        Utils.setTimecycle(data.value)
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

        Utils.setTimecycle(Client.defaultTimecycles[Client.interiorId][data.roomId].value)

        cb(Client.defaultTimecycles[Client.interiorId][data.roomId])
    end
end)
