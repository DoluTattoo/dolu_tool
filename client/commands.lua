-- Self-managed keybinds
-- Instead of registering FiveM keybinds (RegisterKeyMapping) that can only be
-- rebound from the pause menu, dolu_tool detects raw key presses itself. This
-- lets players rebind and reset every key at runtime from the "Settings" tab of
-- the NUI. Defaults live in config.lua, overrides are persisted through KVP.

local KVP_KEY <const> = 'dolu_tool:keybinds'

-- Canonical key name -> Windows virtual-key code used by IsRawKeyPressed.
-- The NUI produces the exact same canonical names (see web/src/utils/keys.ts).
local KEY_CODES = {
    SPACE = 0x20, ENTER = 0x0D, TAB = 0x09, BACKSPACE = 0x08,
    DELETE = 0x2E, INSERT = 0x2D, HOME = 0x24, END = 0x23,
    PAGEUP = 0x21, PAGEDOWN = 0x22,
    LEFT = 0x25, UP = 0x26, RIGHT = 0x27, DOWN = 0x28,
    SHIFT = 0x10, CTRL = 0x11, ALT = 0x12, CAPSLOCK = 0x14,
    MINUS = 0xBD, EQUAL = 0xBB, LBRACKET = 0xDB, RBRACKET = 0xDD,
    BACKSLASH = 0xDC, SEMICOLON = 0xBA, QUOTE = 0xDE, COMMA = 0xBC,
    PERIOD = 0xBE, SLASH = 0xBF, BACKQUOTE = 0xC0,
    NUMMULTIPLY = 0x6A, NUMADD = 0x6B, NUMSUBTRACT = 0x6D,
    NUMDECIMAL = 0x6E, NUMDIVIDE = 0x6F,
}

for i = 1, 12 do KEY_CODES['F' .. i] = 0x6F + i end             -- F1..F12
for i = 0, 25 do KEY_CODES[string.char(65 + i)] = 0x41 + i end  -- A..Z
for i = 0, 9 do KEY_CODES[tostring(i)] = 0x30 + i end           -- 0..9
for i = 0, 9 do KEY_CODES['NUM' .. i] = 0x60 + i end            -- NUM0..NUM9

-- Modifier keys usable inside a combo (e.g. ALT+F3).
-- IsRawKeyDown does not reliably report the generic modifier codes
-- (VK_CONTROL/VK_MENU/VK_SHIFT), so we probe the left/right variants instead.
local MODIFIERS = {
    CTRL = { 0xA2, 0xA3 },  -- VK_LCONTROL, VK_RCONTROL
    ALT = { 0xA4, 0xA5 },   -- VK_LMENU, VK_RMENU
    SHIFT = { 0xA0, 0xA1 },  -- VK_LSHIFT, VK_RSHIFT
}
local MOD_ORDER <const> = { 'CTRL', 'ALT', 'SHIFT' }

--- Returns true when the given modifier (either its left or right key) is held.
local function isModifierDown(name)
    local codes = MODIFIERS[name]
    for i = 1, #codes do
        if IsRawKeyDown(codes[i]) then return true end
    end
    return false
end

--- Normalizes a key combo string into a canonical form ("ALT+F3") or nil when
--- invalid. Modifiers are re-ordered (CTRL, ALT, SHIFT) and the main key is
--- always placed last so the value is stable and easy to compare.
---@param input any
---@return string?
local function normalizeCombo(input)
    if type(input) ~= 'string' or input == '' then return nil end

    local mods, mainKey = {}, nil

    for token in input:upper():gmatch('[^%+%s]+') do
        if MODIFIERS[token] then
            mods[token] = true
        elseif KEY_CODES[token] then
            if mainKey then return nil end -- more than one main key
            mainKey = token
        else
            return nil -- unknown token
        end
    end

    -- Combo made only of modifiers: promote one to be the main key.
    if not mainKey then
        for _, m in ipairs(MOD_ORDER) do
            if mods[m] then mainKey = m end
        end
        if not mainKey then return nil end
        mods[mainKey] = nil
    end

    local parts = {}
    for _, m in ipairs(MOD_ORDER) do
        if mods[m] and m ~= mainKey then parts[#parts + 1] = m end
    end
    parts[#parts + 1] = mainKey

    return table.concat(parts, '+')
end

--- Parses a canonical combo into a table { key = 'F3', mods = { ALT = true } }.
--- The main key is always the last token.
local function parseCombo(combo)
    local tokens = {}
    for token in combo:gmatch('[^%+]+') do tokens[#tokens + 1] = token end

    local mods = {}
    for i = 1, #tokens - 1 do mods[tokens[i]] = true end

    return { key = tokens[#tokens], mods = mods }
end

--- Returns true when the exact combo is pressed this frame: the main key was
--- just pressed and the required modifiers (and only those) are held down.
local function isComboPressed(parsed)
    local code = KEY_CODES[parsed.key]
    if not code or not IsRawKeyPressed(code) then return false end

    for modName in pairs(MODIFIERS) do
        if modName ~= parsed.key then
            local down = isModifierDown(modName)
            if parsed.mods[modName] then
                if not down then return false end
            elseif down then
                return false
            end
        end
    end

    return true
end

local function hasPermission()
    return not Config.usePermission or lib.callback.await('dolu_tool:isAllowed', 100, true)
end

-------------------------------------------------------------------------------
-- Action handlers
-------------------------------------------------------------------------------

local function openMenuAction()
    if not hasPermission() then return end

    if not IsNuiFocused() and not IsPauseMenuActive() then
        Utils.openUI()
    end
end

local function toggleNoclipAction()
    if not hasPermission() then return end

    SetNoclipActive(not Client.noClip)
end

-- Teleport to marker, inspired by ox_commands (tpm)
-- Original work Copyright (C) Overextended - Modified under GPL-3.0 license
local function teleportMarkerAction()
    if not hasPermission() then return end

    local marker = GetFirstBlipInfoId(8)

    if marker == 0 then
        return lib.notify({
            title = 'Dolu Tool',
            description = locale('no_marker'),
            type = 'error',
            position = 'top'
        })
    end

    local entity = cache.seat == -1 and cache.vehicle or cache.ped
    local currentCoords = GetEntityCoords(entity)

    Client.lastCoords = vec4(currentCoords.x, currentCoords.y, currentCoords.z, GetEntityHeading(entity))

    local coords = GetBlipInfoIdCoord(marker)
    local heading = GetEntityHeading(entity)
    local z = GetHeightmapBottomZForPosition(coords.x, coords.y)
    local inc = 10.0

    DoScreenFadeOut(150)
    while not IsScreenFadedOut() do
        Wait(0)
    end

    local setCoords = Utils.setPlayerCoords

    while z < 800.0 do
        Wait(0)
        local found, groundZ = GetGroundZFor_3dCoord(coords.x, coords.y, z, false)
        local int = GetInteriorAtCoords(coords.x, coords.y, z)

        if found or int ~= 0 then
            if int ~= 0 then
                local _, _, intZ = GetInteriorPosition(int)
                groundZ = intZ
                found = true
            end
        end

        if found then
            setCoords(coords.x, coords.y, groundZ, heading, true)
            break
        end

        setCoords(coords.x, coords.y, z, heading, true)
        z += inc
    end

    Utils.freezePlayer(false, cache.seat == -1)

    SetGameplayCamRelativeHeading(0)

    Wait(250)
    DoScreenFadeIn(150)
end

local function gobackAction()
    if not hasPermission() then return end

    if not Client.lastCoords then
        return lib.notify({
            title = 'Dolu Tool',
            description = locale('cannot_goback'),
            type = 'error',
            position = 'top'
        })
    end

    Utils.teleportPlayer(Client.lastCoords, true)

    lib.notify({
        title = 'Dolu Tool',
        description = locale('teleport_success'),
        type = 'success',
        position = 'top'
    })
end

-- Ordered list of bindable actions. Order is preserved in the Settings tab.
-- `required` actions cannot be left unbound (e.g. opening the menu).
local ACTIONS = {
    { name = 'openMenu', default = Config.openMenuKey, onPressed = openMenuAction, required = true },
    { name = 'toggleNoclip', default = Config.toggleNoclipKey, onPressed = toggleNoclipAction },
    { name = 'teleportMarker', default = Config.teleportMarkerKey, onPressed = teleportMarkerAction },
    { name = 'goback', default = Config.gobackKey, onPressed = gobackAction },
}

-------------------------------------------------------------------------------
-- State (defaults + persisted overrides)
-------------------------------------------------------------------------------

local currentKeys = {}       -- name -> canonical combo string or nil (unbound)
local parsedKeys = {}        -- name -> parsed combo (for the listener)
local actionsByName = {}     -- name -> action
local savedOverrides = json.decode(GetResourceKvpString(KVP_KEY) or 'null') or {}

local function setCurrentKey(name, combo)
    currentKeys[name] = combo
    parsedKeys[name] = combo and parseCombo(combo) or nil
end

for _, action in ipairs(ACTIONS) do
    actionsByName[action.name] = action

    -- Resolve the default combo. A required action must always stay bound, so
    -- fall back to F3 if its configured default is empty/invalid.
    action.defaultCombo = normalizeCombo(action.default)
    if action.required and not action.defaultCombo then
        action.defaultCombo = 'F3'
    end

    local override = savedOverrides[action.name]
    if override ~= nil then
        -- An empty string is an explicit "unbound" choice made by the player.
        setCurrentKey(action.name, normalizeCombo(override) or (action.required and action.defaultCombo or nil))
    else
        setCurrentKey(action.name, action.defaultCombo)
    end
end

--- Builds the keybind list sent to the NUI. Unbound keys are `false`.
local function buildKeybindList()
    local list = {}

    for i = 1, #ACTIONS do
        local action = ACTIONS[i]
        list[i] = {
            name = action.name,
            key = currentKeys[action.name] or false,
            default = action.defaultCombo or false,
            required = action.required or false
        }
    end

    return list
end

local function persistOverrides()
    if next(savedOverrides) == nil then
        DeleteResourceKvp(KVP_KEY)
    else
        SetResourceKvp(KVP_KEY, json.encode(savedOverrides))
    end
end

-------------------------------------------------------------------------------
-- Raw key listener
-------------------------------------------------------------------------------

CreateThread(function()
    while true do
        local sleep = 200

        if not Client.captureKeybind and not Client.isMenuOpen and not IsPauseMenuActive() then
            sleep = 0

            for name, action in pairs(actionsByName) do
                local parsed = parsedKeys[name]

                if parsed and isComboPressed(parsed) then
                    action.onPressed()
                end
            end
        end

        Wait(sleep)
    end
end)

-------------------------------------------------------------------------------
-- NUI callbacks
-------------------------------------------------------------------------------

RegisterNUICallback('dolu_tool:getKeybinds', function(_, cb)
    cb(buildKeybindList())
end)

RegisterNUICallback('dolu_tool:setKeybind', function(data, cb)
    local action = data and actionsByName[data.name]

    if action then
        local combo = normalizeCombo(data.key)

        -- Required actions can be rebound but never left unbound.
        if combo or not action.required then
            setCurrentKey(action.name, combo)
            savedOverrides[action.name] = combo or ''
            persistOverrides()
        end
    end

    cb(buildKeybindList())
end)

RegisterNUICallback('dolu_tool:resetKeybind', function(data, cb)
    local action = data and actionsByName[data.name]

    if action then
        savedOverrides[action.name] = nil
        setCurrentKey(action.name, action.defaultCombo)
        persistOverrides()
    end

    cb(buildKeybindList())
end)

RegisterNUICallback('dolu_tool:resetAllKeybinds', function(_, cb)
    savedOverrides = {}

    for _, action in ipairs(ACTIONS) do
        setCurrentKey(action.name, action.defaultCombo)
    end

    persistOverrides()
    cb(buildKeybindList())
end)

RegisterNUICallback('dolu_tool:captureKeybind', function(state, cb)
    Client.captureKeybind = state == true
    cb(1)
end)

RegisterNUICallback('dolu_tool:triggerKeybind', function(name, cb)
    cb(1)
    local action = actionsByName[name]

    if action and name ~= 'openMenu' then
        action.onPressed()
    end
end)

-------------------------------------------------------------------------------
-- Chat commands kept for convenience (independent from the keybinds)
-------------------------------------------------------------------------------

RegisterCommand('dolu_tool', function()
    openMenuAction()
end)

RegisterCommand('goback', function()
    gobackAction()
end)
