"use client"

import { useEffect } from "react"
import Script from "next/script"

interface FeaturebaseFeedbackProps {
  organization: string
  theme?: "light" | "dark" | ""
  hideMenu?: boolean
  hideLogo?: boolean
  path?: string
  filters?: string
  locale?: string
}

export default function FeaturebaseFeedback({
  organization,
  theme = "dark",
  hideMenu = false,
  hideLogo = false,
  path = "/",
  filters = "",
  locale = "en"
}: FeaturebaseFeedbackProps) {
  useEffect(() => {
    const win = window as any

    if (typeof win.Featurebase !== "function") {
      win.Featurebase = function () {
        // eslint-disable-next-line prefer-rest-params
        (win.Featurebase.q = win.Featurebase.q || []).push(arguments)
      }
    }

    win.Featurebase("init_embed_widget", {
      /* Required - Organization identifier */
      organization: organization,

      embedOptions: {
        path: path,
        filters: filters,
      },

      /* Optional - Styling configuration */
      stylingOptions: {
        theme: theme,
        hideMenu: hideMenu,
        hideLogo: hideLogo,
      },

      /* Optional - Localization */
      locale: locale
    })
  }, [organization, theme, hideMenu, hideLogo, path, filters, locale])

  return (
    <>
      <Script src="https://do.featurebase.app/js/sdk.js" id="featurebase-sdk" />
      <div data-featurebase-embed className="min-h-[600px]"></div>
    </>
  )
}


