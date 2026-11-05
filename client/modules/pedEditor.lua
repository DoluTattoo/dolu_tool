-- Peds tab: appearance & animations of the player's ped

local PROP_IDS = { 0, 1, 2, 6, 7 }
local RECENT_KVP = 'dolu_tool:recentAnimations'
local MAX_RECENT = 10
local ANIM_START_DELAY = 250 -- The task needs a moment before the game reports it as playing

local activeAnimation = false

local function getRecentAnimations()
    return json.decode(GetResourceKvpString(RECENT_KVP) or '[]')
end

local function addRecentAnimation(dict, clip)
    local recent = { { dict = dict, clip = clip } }

    for _, animation in ipairs(getRecentAnimations()) do
        if #recent < MAX_RECENT and (animation.dict ~= dict or animation.clip ~= clip) then
            recent[#recent + 1] = animation
        end
    end

    SetResourceKvp(RECENT_KVP, json.encode(recent))
end

local function getComponents(ped)
    local components = {}

    for id = 0, 11 do
        local drawable = GetPedDrawableVariation(ped, id)

        components[#components + 1] = {
            id = id,
            drawable = drawable,
            drawableCount = GetNumberOfPedDrawableVariations(ped, id),
            texture = GetPedTextureVariation(ped, id),
            textureCount = GetNumberOfPedTextureVariations(ped, id, drawable)
        }
    end

    return components
end

local function getProps(ped)
    local props = {}

    for _, id in ipairs(PROP_IDS) do
        local drawable = GetPedPropIndex(ped, id)

        props[#props + 1] = {
            id = id,
            drawable = drawable,
            drawableCount = GetNumberOfPedPropDrawableVariations(ped, id),
            texture = drawable < 0 and 0 or GetPedPropTextureIndex(ped, id),
            textureCount = drawable < 0 and 0 or GetNumberOfPedPropTextureVariations(ped, id, drawable)
        }
    end

    return props
end

local function getActiveAnimation(ped)
    if not activeAnimation then return false end

    local playing

    if activeAnimation.scenario then
        playing = IsPedUsingAnyScenario(ped)
    else
        playing = IsEntityPlayingAnim(ped, activeAnimation.dict, activeAnimation.clip, 3)
    end

    if not playing then
        activeAnimation = false
    end

    return activeAnimation
end

local function getEditorState()
    local ped = cache.ped

    return {
        model = GetEntityArchetypeName(ped),
        components = getComponents(ped),
        props = getProps(ped),
        animation = getActiveAnimation(ped),
        recentAnimations = getRecentAnimations()
    }
end

local function notifyError(description)
    lib.notify({
        title = 'Dolu Tool',
        description = description,
        type = 'error',
        position = 'top'
    })
end

--- Registers an editor action: every action replies with the fresh editor state,
--- so the UI always reflects the game, even when the action failed.
local function registerAction(name, action)
    RegisterNUICallback(name, function(data, cb)
        action(cache.ped, data)
        cb(getEditorState())
    end)
end

RegisterNUICallback('dolu_tool:getPedEditor', function(_, cb)
    cb(getEditorState())
end)

RegisterNUICallback('dolu_tool:getPedAnimation', function(_, cb)
    cb(getActiveAnimation(cache.ped))
end)

registerAction('dolu_tool:setPedComponent', function(ped, data)
    SetPedComponentVariation(ped, data.id, data.drawable, data.texture, GetPedPaletteVariation(ped, data.id))
end)

registerAction('dolu_tool:setPedProp', function(ped, data)
    if data.drawable < 0 then
        ClearPedProp(ped, data.id)
    else
        SetPedPropIndex(ped, data.id, data.drawable, data.texture, true)
    end
end)

registerAction('dolu_tool:resetPedAppearance', function(ped)
    SetPedDefaultComponentVariation(ped)
    ClearAllPedProps(ped)
end)

registerAction('dolu_tool:randomizePedAppearance', function(ped)
    SetPedRandomComponentVariation(ped, 0)
    SetPedRandomProps(ped)
end)

registerAction('dolu_tool:playPedAnimation', function(ped, data)
    local dict, clip = data.dict, data.clip

    if not DoesAnimDictExist(dict) then
        return notifyError(locale('anim_dict_not_found', dict))
    end

    lib.requestAnimDict(dict)

    if GetAnimDuration(dict, clip) <= 0 then
        RemoveAnimDict(dict)
        return notifyError(locale('anim_clip_not_found', clip))
    end

    -- Whole numbers are decoded from JSON as integers, these parameters are floats
    TaskPlayAnim(ped, dict, clip, data.blendIn + 0.0, data.blendOut + 0.0, data.duration, data.flags, data.startPhase + 0.0, false, false, false)
    RemoveAnimDict(dict)

    activeAnimation = { dict = dict, clip = clip, flags = data.flags }
    addRecentAnimation(dict, clip)
    Wait(ANIM_START_DELAY)
end)

registerAction('dolu_tool:playPedScenario', function(ped, data)
    ClearPedTasks(ped)
    TaskStartScenarioInPlace(ped, data.scenario, 0, true)

    activeAnimation = { scenario = data.scenario }
    Wait(ANIM_START_DELAY)
end)

registerAction('dolu_tool:stopPedAnimation', function(ped)
    -- Upper body and secondary clips are not stopped by ClearPedTasks
    if activeAnimation and activeAnimation.clip then
        StopAnimTask(ped, activeAnimation.dict, activeAnimation.clip, 1.0)
    end

    ClearPedTasks(ped)
    activeAnimation = false
end)
