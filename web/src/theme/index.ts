import {
  createTheme,
  defaultVariantColorsResolver,
  parseThemeColor,
  rgba,
  type VariantColorsResolver,
} from '@mantine/core'

// Restore the pre-v9 "light" look: a subtle translucent background tinted with
// the component color instead of Mantine v9's solid fill for indexed colors
// (e.g. `blue.4`). Applies to every component that uses `variant="light"`.
//
// The background is built with `rgba()` (not `color-mix`) so it renders in the
// older Chromium/CEF build embedded in FiveM, which does not support color-mix.
const variantColorResolver: VariantColorsResolver = (input) => {
  const resolved = defaultVariantColorsResolver(input)

  const parsed = parseThemeColor({
    color: input.color || input.theme.primaryColor,
    theme: input.theme,
  })

  if (parsed.isThemeColor) {
    const name = (parsed.color ?? '').split('.')[0]
    const palette = input.theme.colors[name]

    if (palette) {
      const idx = typeof parsed.shade === 'number' ? parsed.shade : 6
      const raw = palette[idx] ?? palette[6]

      if (input.variant === 'light') {
        return {
          ...resolved,
          background: rgba(raw, 0.12),
          hover: rgba(raw, 0.2),
          color: parsed.value,
        }
      }

      // Keep hover backgrounds working on CEF too (subtle relies on
      // color-mix based CSS variables by default).
      if (input.variant === 'subtle') {
        return {
          ...resolved,
          hover: rgba(raw, 0.12),
        }
      }
    }
  }

  return resolved
}

export const customTheme = createTheme({
  fontFamily: 'Roboto',
  shadows: { sm: '1px 1px 3px rgba(0, 0, 0, 0.5)' },
  variantColorResolver,
  components: {
    Button: {
      defaultProps: { variant: 'light', radius: 'sm' },
    },
    // Tooltips default to a light background in dark mode; force a dark one that
    // matches the app. Per-instance `color` props (e.g. the orange update
    // warning) still override this default.
    Tooltip: {
      defaultProps: { color: 'dark.7' },
      styles: {
        tooltip: {
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    // Seamless modals: the header used to render as a solid dark bar on top of
    // a lighter body. Make it transparent and compact so the title blends into
    // the modal content instead of looking like a separate title bar.
    Modal: {
      styles: {
        content: {
          backgroundColor: 'rgba(24, 24, 27, 0.97)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '10px',
        },
        header: {
          backgroundColor: 'transparent',
          minHeight: 'auto',
          paddingBottom: 4,
        },
        title: {
          fontWeight: 600,
        },
        body: {
          paddingTop: 4,
        },
      }
    },
    Paper: {
      styles: {
        root: {
          backgroundColor: 'rgba(24, 24, 27, 0.8)',
          borderRadius: '5px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }
      }
    }
  }
})
