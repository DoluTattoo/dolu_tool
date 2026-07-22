fx_version 'cerulean'
use_experimental_fxv2_oal 'yes'
lua54 'yes'
game 'gta5'

name 'dolu_tool'
version '4.7.1'
description 'A tool for FiveM developpers'
author 'Dolu'
repository 'https://github.com/dolutattoo/dolu_tool'

shared_scripts {
    '@ox_lib/init.lua',
    'config.lua'
}

server_script 'server/version.lua'

shared_script 'shared/init.lua'

client_scripts {
    'client/main.lua',
    'client/utils.lua',
    'client/menu.lua',
    'client/controls.lua',
    'client/keybinds.lua',
    'client/noclip.lua',
    'client/instructionalButtons.lua',
    'client/target.lua',
    'client/modules/audio.lua',
    'client/modules/interior.lua',
    'client/modules/locations.lua',
    'client/modules/object.lua',
    'client/modules/peds.lua',
    'client/modules/vehicles.lua',
    'client/modules/weapons.lua',
    'client/modules/world.lua',
}

server_scripts {
    'server/main.lua'
}

ui_page 'web/build/index.html'

files {
    'web/build/index.html',
    'web/build/**/*',
    'locales/*.json'
}

dependencies {
    '/server:5104',
    '/onesync',
    'ox_lib'
}
