-- World tab: game clock & weather

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

local function getClock()
    return GetClockHours(), GetClockMinutes(), GetClockSeconds()
end

local function setClock(hour, minutes, seconds)
    hour = tonumber(hour) or 0
    minutes = tonumber(minutes) or 0
    seconds = tonumber(seconds) or 0

    NetworkOverrideClockTime(hour, minutes, seconds)
end

local function getWeather()
    local weatherType1, weatherType2, percentWeather2 = GetWeatherTypeTransition()
    local currentWeather = percentWeather2 > 0.5 and weatherType2 or weatherType1

    return WEATHER_LIST[currentWeather]
end

local function setWeather(weather)
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

Menu.onTabOpen('world', function()
    local hour, minute = getClock()

    SendNUIMessage({
        action = 'setWorldData',
        data = {
            clock = { hour = hour, minute = minute },
            weather = getWeather()
        }
    })
end)

RegisterNUICallback('dolu_tool:setWeather', function(weatherName, cb)
    cb(1)
    setWeather(weatherName)
end)

RegisterNUICallback('dolu_tool:setClock', function(clock, cb)
    cb(1)
    setClock(clock.hour, clock.minute)
end)

RegisterNUICallback('dolu_tool:getClock', function(_, cb)
    cb(1)
    local hour, minute = getClock()

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

RegisterNUICallback('dolu_tool:setDay', function(_, cb)
    cb(1)
    setClock(12)
    setWeather('extrasunny')
end)

RegisterNUICallback('dolu_tool:cleanZone', function(_, cb)
    cb(1)
    local playerId = cache.ped
    local playerCoords = GetEntityCoords(playerId)

    ClearAreaOfEverything(playerCoords.x, playerCoords.y, playerCoords.z, 1000.0, false, false, false, false)
end)

-- Freezing time/weather
CreateThread(function()
    while true do
        if Client.freezeTime then
            local hour, minute, second = getClock()
            setClock(hour, minute, second)
        end

        if Client.freezeWeather then
            local currentWeather = getWeather()
            setWeather(currentWeather)
        end

        if not Client.freezeTime and not Client.freezeWeather then
            Wait(200)
        end
        Wait(0)
    end
end)
