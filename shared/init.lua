Shared = {}

if not GetResourceState('ox_lib'):find('start') then
    print('^1[dolu_tool][error] ox_lib should be started before this resource^0', 2)
    if not lib or not cache then return end
end

if not LoadResourceFile(cache.resource, 'web/build/index.html') then
    local err = '^4[dolu_tool] ^1Unable to load UI. Build dolu_tool or download the latest release:\n  -> ^3https://github.com/dolutattoo/dolu_tool/releases/latest/download/dolu_tool.zip^0'
    Shared.isUiLoaded = false
    print(err)
else
    Shared.isUiLoaded = true
end


if GetResourceState('ox_inventory'):find('start') then
    Shared.ox_inventory = true
end

-- Localization
-- Load the configured language once (with a per-key fallback on English) and
-- share it between the Lua scripts and the NUI.
local localeData do
    local data = json.decode(LoadResourceFile(cache.resource, 'locales/en.json') or '{}')
    local lang = Config.language or 'en'

    if lang ~= 'en' then
        local file = LoadResourceFile(cache.resource, ('locales/%s.json'):format(lang))

        if file then
            for key, value in pairs(json.decode(file) or {}) do
                data[key] = value
            end
        else
            print(("^3[dolu_tool] Locale '%s' not found, falling back to 'en'^0"):format(lang))
        end
    end

    localeData = data
end

Shared.locale = localeData

--- Returns the translated string for `key`, formatted with the extra arguments.
--- Falls back to the key itself when the translation is missing.
---@param key string
---@param ... string | number
---@return string
function locale(key, ...)
    local str = localeData[key]

    if not str then return key end
    if select('#', ...) > 0 then return str:format(...) end

    return str
end
