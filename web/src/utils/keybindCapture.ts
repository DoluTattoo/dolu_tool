// Shared, render-free flag coordinating keybind capture between the Settings
// view (which reads the next key press) and the global Escape exit listener
// (useExitListener). While `active` is true, Escape must not close the menu.
// `swallowEscapeUp` absorbs the single keyup that follows the Escape keydown
// used to cancel a capture, so cancelling with Escape never closes the menu.
export const keybindCapture = {
  active: false,
  swallowEscapeUp: false,
}
