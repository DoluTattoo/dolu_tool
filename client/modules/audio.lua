-- Audio tab: static emitters & radio stations

local function getClosestStaticEmitter()
    local closestEmitter = nil
    local closestDistance = 10000

    for _, emitter in ipairs(Client.data.staticEmitters) do
        local distance = #(GetEntityCoords(cache.ped) - emitter.coords)

        if distance < closestDistance then
            closestDistance = math.floor(distance)
            closestEmitter = emitter
        end
    end

    if not closestEmitter then return end

    SendNUIMessage({
        action = 'setClosestEmitter',
        data = {
            distance = closestDistance,
            coords = math.floor(closestEmitter.coords.x) .. ', ' .. math.floor(closestEmitter.coords.y) .. ', ' .. math.floor(closestEmitter.coords.z),
            name = closestEmitter.name,
            flags = closestEmitter.flags,
            interior = closestEmitter.interior,
            room = closestEmitter.room,
            radiostation = closestEmitter.radiostation
        }
    })
end

Menu.onTabOpen('audio', function()
    if Client.audioLoaded then return end

    getClosestStaticEmitter()

    SendNUIMessage({
        action = 'setRadioStationsList',
        data = Client.data.radioStations
    })

    Client.audioLoaded = true
end)

RegisterNUICallback('dolu_tool:getClosestStaticEmitter', function(_, cb)
    cb(1)
    getClosestStaticEmitter()
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

RegisterNUICallback('dolu_tool:setStaticEmitterDrawDistance', function(distance, cb)
    cb(1)
    Client.staticEmitterDrawDistance = distance
end)

-- Draw static emitters
CreateThread(function()
    while true do
        if Client.drawStaticEmitters then
            local coords = GetEntityCoords(cache.ped)

            for _, v in ipairs(Client.data.staticEmitters) do
                if #(v.coords - coords) < Client.staticEmitterDrawDistance then
                    ---@diagnostic disable-next-line: param-type-mismatch
                    DrawMarker(28, v.coords.x, v.coords.y, v.coords.z, 0, 0, 0, 0, 0, 0, 0.5, 0.5, 0.5, 0, 0, 255, 255, false, false, 0, false, nil, nil, false)
                end
            end
        else
            Wait(200)
        end
        Wait(0)
    end
end)
