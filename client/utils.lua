-- Shared client helpers

Utils = {}

Utils.round = function(num, decimals)
    local power = 10 ^ decimals

    return math.floor(num * power) / power
end

--- Builds the timecycle modifiers list from game natives at startup.
--- Avoids shipping a heavy json file and always matches the timecycles
--- actually loaded by the game. The variable count is exposed as a separate
--- field so the UI can display it discreetly next to each item.
---@return { label: string, value: string, varCount: number }[]
Utils.getTimecycleModifiers = function()
    local modifiers = {}
    local seen = {}
    local duplicates = {}
    local duplicateCount = 0
    local count = GetTimecycleModifierCount()

    for index = 0, count - 1 do
        local name = GetTimecycleModifierNameByIndex(index)

        if name then
            local value = tostring(joaat(name))
            local existing = seen[value]

            if existing then
                -- A timecycle sharing the same joaat hash is already registered.
                -- The UI Select requires unique values, so we skip this duplicate
                -- and keep track of it to warn about a broken timecycle setup.
                duplicateCount = duplicateCount + 1

                if not duplicates[value] then
                    duplicates[value] = { name = existing.label, value = value, count = 1 }
                else
                    duplicates[value].count = duplicates[value].count + 1
                end
            else
                local option = {
                    label = name,
                    value = value,
                    varCount = GetTimecycleModifierVarCount(name)
                }
                seen[value] = option
                modifiers[#modifiers + 1] = option
            end
        end
    end

    if duplicateCount > 0 then
        local uniqueDuplicates = 0
        for _ in pairs(duplicates) do uniqueDuplicates = uniqueDuplicates + 1 end

        print(('^3[dolu_tool] Found %d duplicate timecycle(s) across %d name(s). It is not normal to have timecycle duplicates!^7')
            :format(duplicateCount, uniqueDuplicates))

        for _, dup in pairs(duplicates) do
            print(('^3[dolu_tool]   - "%s" (value: %s) appeared %d extra time(s)^7')
                :format(dup.name, dup.value, dup.count))
        end
    end

    table.sort(modifiers, function(a, b) return a.label < b.label end)

    return modifiers
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
            coords = ('%.4f, %.4f, %.4f'):format(coords.x, coords.y, coords.z),
            heading = tostring(Utils.round(heading, 4))
        }
    })

    return coords, heading
end

Utils.teleportPlayer = function(coords, updateLastCoords)
    ---@diagnostic disable-next-line: undefined-field
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

Utils.getPages = function(page, list, itemPerPage)
    local start = (page - 1) * itemPerPage + 1 -- start index of the page
    local finish = start + itemPerPage - 1     -- end index of the page
    local pageContent = {}

    for i = start, math.min(finish, #list) do
        pageContent[#pageContent + 1] = list[i]
    end

    return pageContent
end

Utils.loadPage = function(listType, activePage, filter, checkboxes)
    local totalList = Client.data[listType]
    local filteredList = {}
    local itemPerPage = 20 -- 4x5 image grid (peds, vehicles, weapons)

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
