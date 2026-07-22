-- Locations tab: saved locations & teleportation

Menu.onTabOpen('locations', function()
    if Client.locationsLoaded then return end

    Utils.loadPage('locations', 1)
    Client.locationsLoaded = true
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

RegisterNUICallback('dolu_tool:setCustomCoords', function(data, cb)
    cb(1)

    local formatedCoords

    if data.coordString then
        local coordString = (data.coordString:gsub(',', '')):gsub('  ', ' ')
        local coords = {}

        for match in (coordString .. ' '):gmatch('(.-) ') do
            table.insert(coords, match)
        end

        local x = tonumber(coords[1])
        local y = tonumber(coords[2])
        local z = tonumber(coords[3])

        if x and y and z then
            formatedCoords = vec3(x, y, z)
        end
    elseif data.coords then
        formatedCoords = vec3(data.coords.x, data.coords.y, data.coords.z)
    end

    if formatedCoords then
        Utils.teleportPlayer(formatedCoords, true)
    end
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
