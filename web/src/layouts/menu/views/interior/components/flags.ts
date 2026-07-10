// Interior flag definitions.
// Names sourced from the Sollumz Blender addon (ytyp/properties/flags.py) so
// they match what mappers see in CodeWalker / Sollumz.

export interface FlagOption {
  value: string
  label: string
}

// RoomFlags (10 bits)
export const ROOM_FLAGS: FlagOption[] = [
  { value: '1', label: 'Freeze Vehicles' },
  { value: '2', label: 'Freeze Peds' },
  { value: '4', label: 'No Directional Light' },
  { value: '8', label: 'No Exterior Lights' },
  { value: '16', label: 'Force Freeze' },
  { value: '32', label: 'Reduce Cars' },
  { value: '64', label: 'Reduce Peds' },
  { value: '128', label: 'Force Directional Light On' },
  { value: '256', label: "Don't Render Exterior" },
  { value: '512', label: 'Mirror Potentially Visible' },
]

// PortalFlags (14 bits)
export const PORTAL_FLAGS: FlagOption[] = [
  { value: '1', label: 'One Way' },
  { value: '2', label: 'Link Interiors Together' },
  { value: '4', label: 'Mirror' },
  { value: '8', label: 'Disable Timecycle Modifier' },
  { value: '16', label: 'Mirror Using Expensive Shaders' },
  { value: '32', label: 'Low LOD Only' },
  { value: '64', label: 'Hide When Door Closed' },
  { value: '128', label: 'Mirror Can See Directional' },
  { value: '256', label: 'Mirror Using Portal Traversal' },
  { value: '512', label: 'Mirror Floor' },
  { value: '1024', label: 'Mirror Can See Exterior View' },
  { value: '2048', label: 'Water Surface' },
  { value: '4096', label: 'Water Surface Extend To Horizon' },
  { value: '8192', label: 'Use Light Bleed' },
]

// Decompose a flag total into the list of active flag values (as strings)
export const flagsToValues = (options: FlagOption[], total: number | undefined): string[] =>
  options.filter((o) => ((total ?? 0) & Number(o.value)) !== 0).map((o) => o.value)
