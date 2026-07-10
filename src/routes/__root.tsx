import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";

import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from "@mantine/core";

import { theme } from "@/shared/theme";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { createRootRouteWithContext, HeadContent, Outlet, Scripts } from "@tanstack/react-router";

import { DatesProvider } from "@mantine/dates";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import dayjs from "dayjs";
import type { QueryClient } from "@tanstack/react-query";

const SITE_NAME = "rezervo-mirage";
const SITE_DESCRIPTION =
  "Fiktiv treningsleverandør og admin-studio for rezervo – testdata for kjeder, regioner, sentre, timer og medlemmer.";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      { title: SITE_NAME },
      { name: "description", content: SITE_DESCRIPTION },
      { name: "application-name", content: SITE_NAME },
      { name: "theme-color", content: "#4caf50" },
      // Open Graph – controls link previews when the URL is shared.
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:title", content: SITE_NAME },
      { property: "og:description", content: SITE_DESCRIPTION },
      { property: "og:locale", content: "nb_NO" },
      { property: "og:image", content: "/rezervo-mirage-logo.png" },
      // Twitter/X card.
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: SITE_NAME },
      { name: "twitter:description", content: SITE_DESCRIPTION },
      { name: "twitter:image", content: "/rezervo-mirage-logo.png" },
    ],
    links: [
      { rel: "icon", href: "/favicon.ico", sizes: "any" },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", type: "image/png", sizes: "96x96", href: "/favicon-96x96.png" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/site.webmanifest" },
    ],
  }),
  component: RootLayout,
});

function RootLayout() {
  dayjs.extend(customParseFormat);
  dayjs.locale("nb");
  return (
    <html lang="no" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme={"auto"} />
        <HeadContent />
      </head>
      <body>
        <MantineProvider theme={theme} defaultColorScheme={"auto"}>
          <Notifications />
          <DatesProvider settings={{ locale: "nb" }}>
            <ModalsProvider>
              <Outlet />
              <Scripts />
            </ModalsProvider>
            <ReactQueryDevtools />
          </DatesProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
