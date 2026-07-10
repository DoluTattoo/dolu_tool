local currentVersion = GetResourceMetadata('dolu_tool', 'version', 0)

if currentVersion then
    currentVersion = currentVersion:match('%d%.%d+%.%d+')
end

local versionData = { currentVersion = currentVersion }
local versionChecked = false

local function checkVersion()
    if not currentVersion then
        versionChecked = true
        return print("^1Unable to determine current resource version for 'dolu_tool' ^0")
    end

    PerformHttpRequest('https://api.github.com/repos/dolutattoo/dolu_tool/releases/latest', function(status, response)
        if status == 200 then
            response = json.decode(response)

            if not response.prerelease then
                local latestVersion = response.tag_name:match('%d%.%d+%.%d+')

                if latestVersion and latestVersion ~= currentVersion then
                    local cv = { string.strsplit('.', currentVersion) }
                    local lv = { string.strsplit('.', latestVersion) }

                    for i = 1, #cv do
                        local current, minimum = tonumber(cv[i]), tonumber(lv[i])

                        if current ~= minimum then
                            if current < minimum then
                                versionData = { currentVersion = currentVersion, url = response.html_url }
                                print(("^3An update is available for 'dolu_tool' (current version: %s)\r\n%s^0"):format(currentVersion, response.html_url))
                            end

                            break
                        end
                    end
                end
            end
        end

        versionChecked = true
    end, 'GET')
end

SetTimeout(200, checkVersion)

SetTimeout(10000, function()
    versionChecked = true
end)

lib.callback.register('dolu_tool:getVersion', function()
    while not versionChecked do Wait(50) end
    return versionData
end)
