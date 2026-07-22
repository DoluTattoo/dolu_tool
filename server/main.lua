Server = {}

local function getFileData(path, file)
    return json.decode(LoadResourceFile(cache.resource, path .. '/' .. file))
end

local function updateFileData(path, file, data)
    return SaveResourceFile(cache.resource, path .. '/' .. file, json.encode(data, { indent = true }), -1)
end

local function formatVanillaInteriors(vanillaInteriors)
    local formatedLocations = {}
    local count = 0

    for i = 1, #vanillaInteriors do
        local v = vanillaInteriors[i]
        if v.Locations[1] then
            count += 1
            formatedLocations[count] = {
                name = v.Name,
                x = math.floor(v.Locations[1].Position.X * 10 ^ 2) / 10 ^ 2,
                y = math.floor(v.Locations[1].Position.Y * 10 ^ 2) / 10 ^ 2,
                z = math.floor(v.Locations[1].Position.Z * 10 ^ 2) / 10 ^ 2,
                heading = 0,
                metadata = {
                    dlc = v.DlcName,
                    ytyp = v.FilePath,
                    ymap = v.Locations[1].FilePath,
                    totalEntitiesCount = v.TotalEntitiesCount
                }
            }
        end
    end

    return formatedLocations
end

local function formatRadioStations(radioStations)
    local formatedRadioStations = {}

    for i = 1, #radioStations do
        local v = radioStations[i]
        table.insert(formatedRadioStations, { label = v.RadioName, value = v.RadioName })
    end

    return formatedRadioStations
end

local function formatStaticEmitters(staticEmitters)
    local formatedStaticEmitters = {}

    for i = 1, #staticEmitters do
        local v = staticEmitters[i]
        table.insert(formatedStaticEmitters, {
            name = v.Name,
            coords = vec3(v.Position.X, v.Position.Y, v.Position.Z),
            flags = v.Flags,
            interior = v.Interior,
            room = v.Room,
            radiostation = v.RadioStation
        })
    end

    return formatedStaticEmitters
end

local function filterCustomLocations()
    -- Filter custom locations to update 'locations.json'
    local customLocations = {}
    for _, v in ipairs(Server.locations) do
        if v.custom then
            customLocations[#customLocations + 1] = v
        end
    end
    return customLocations
end

if Config.usePermission then
    for j = 1, #Config.permission do
        lib.addAce(Config.permission[j], 'dolu_tool')
    end

    lib.callback.register('dolu_tool:isAllowed', function(source, notify)
        local allowed = IsPlayerAceAllowed(source, 'dolu_tool')

        if not allowed and notify then
            lib.notify(source, {
                title = 'Dolu Tool',
                description = 'You do not have permission to do this.',
                type = 'error'
            })
        end

        return allowed
    end)
end

lib.callback.register('dolu_tool:getData', function()
    local locations = getFileData('shared/data', 'locations.json')

    for _, location in ipairs(locations) do
        location.custom = true
    end

    local vanillaLocations = formatVanillaInteriors(getFileData('shared/data', 'mloInteriors.json'))

    for _, location in ipairs(vanillaLocations) do
        location.custom = false
        table.insert(locations, location)
    end

    Server.locations = locations

    return {
        locations = locations,
        peds = getFileData('shared/data', 'pedList.json'),
        vehicles = getFileData('shared/data', 'vehicleList.json'),
        weapons = getFileData('shared/data', 'weaponList.json'),
        staticEmitters = formatStaticEmitters(getFileData('shared/data', 'staticEmitters.json')),
        radioStations = formatRadioStations(getFileData('shared/data', 'radioStations.json'))
    }
end)

lib.callback.register('dolu_tool:renameLocation', function(source, data)
    local result

    for index, location in ipairs(Server.locations) do
        if location.custom and location.name == data.oldName then
            location.name = data.newName
            result = { index = index, data = location }
        end
    end
    assert(result ~= nil, "Error while trying to rename location. Location not found!")

    local success = updateFileData('shared/data', 'locations.json', filterCustomLocations())
    assert(success == true, "Unable to update 'shared/data/locations.json' file.")

    return result
end)

lib.callback.register('dolu_tool:createCustomLocation', function(source, data)
    local newLocation = {
        name = data.name,
        x = math.round(data.coords.x, 3),
        y = math.round(data.coords.y, 3),
        z = math.round(data.coords.z, 3),
        heading = math.round(data.heading, 3),
        custom = true
    }

    -- Register new location at index 1
    table.insert(Server.locations, 1, newLocation)

    local success = updateFileData('shared/data', 'locations.json', filterCustomLocations())
    assert(success == true, "Unable to update 'shared/data/locations.json' file.")

    return newLocation
end)

lib.callback.register('dolu_tool:deleteLocation', function(source, data)
    local foundIndex
    for k, v in ipairs(Server.locations) do
        if v.custom and v.name == data then
            foundIndex = k
            break
        end
    end
    if not foundIndex then return false end

    table.remove(Server.locations, foundIndex)

    local success = updateFileData('shared/data', 'locations.json', filterCustomLocations())
    assert(success == true, "Unable to update 'shared/data/locations.json' file.")
    return foundIndex
end)

if Shared.ox_inventory then
    local function getAmmo(weaponName)
        local file = ('data/%s.lua'):format('weapons')
        local datafile = LoadResourceFile('ox_inventory', file)
        local path = ('@@%s/%s'):format('ox_inventory', file)

        if not datafile then
            warn(('no datafile found at path %s'):format(path:gsub('@@', '')))
            return {}
        end

        local func, err = load(datafile, path)

        if not func or err then
            return error(err, 0)
        end

        return func().Weapons[weaponName:upper()].ammoname
    end

    lib.callback.register('dolu_tool:giveWeaponToPlayer', function(source, weaponName)
        local success = false

        local ammoName = getAmmo(weaponName)

        if exports.ox_inventory:CanCarryItem(source, weaponName, 1) then
            exports.ox_inventory:AddItem(source, weaponName, 1, { ammo = 100 })
            success = true

            if exports.ox_inventory:CanCarryItem(source, ammoName, 1) then
                local ammoCount = exports.ox_inventory:Search(source, 'count', ammoName)
                if ammoCount < 100 then
                    exports.ox_inventory:AddItem(source, ammoName, 100 - ammoCount)
                end
            end
        end

        return success
    end)
end

-- RegisterCommand('parseVehicleList', function(source, args)
--     if source > 0 then return end

--     local vehicles = getFileData('shared/data', 'vehicleList.json')

--     local data = {}

--     for key, vehicle in ipairs(vehicles) do
--         data[key] = {
--             hash = vehicle.hash,
--             name = vehicle.name,
--             class = vehicle.class,
--             displayName = vehicle.displayName,
--             type = vehicle.type,
--             dlc = vehicle.dlc,
--             manufacturer = vehicle.manufacturer
--         }
--     end

--     updateFileData('shared/data', 'vehicleList.json', data)
-- end, true)
