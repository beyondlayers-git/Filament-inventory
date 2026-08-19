'use client'

import { AppProgressBar as ProgressBar } from 'next-nprogress-bar'

export function NavigationProgress() {
  return (
    <ProgressBar
      height="2px"
      color="oklch(0.50 0.13 255)"
      options={{ showSpinner: false, trickleSpeed: 200 }}
      shallowRouting
    />
  )
}
