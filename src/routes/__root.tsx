import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";

import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { createRootRouteWithContext, HeadContent, Outlet, Scripts } from "@tanstack/react-router";

import { DatesProvider } from "@mantine/dates";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import dayjs from "dayjs";
import type { QueryClient } from "@tanstack/react-query";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      { title: "rezervo-mirage" },
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
        <ColorSchemeScript />
        <HeadContent />
      </head>
      <body>
        <MantineProvider>
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
