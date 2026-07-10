import { Alert, Box, Button, Center, Group, PasswordInput, Stack, Text } from "@mantine/core";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { IconLock } from "@tabler/icons-react";
import { useState } from "react";

import { authStatusFn, loginFn } from "@/features/admin/server/auth";

/** Only honour same-origin relative redirect targets (avoid open redirects). */
function safeRedirect(target: string | undefined): string {
  if (target && target.startsWith("/") && !target.startsWith("//")) {
    return target;
  }
  return "/";
}

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => {
    const target = search["redirect"];
    return typeof target === "string" ? { redirect: target } : {};
  },
  beforeLoad: async ({ search }) => {
    const { authenticated } = await authStatusFn();
    if (authenticated) {
      throw redirect({ href: safeRedirect(search.redirect) });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");

  const login = useMutation({
    mutationFn: () => loginFn({ data: { password } }),
    onSuccess: (result) => {
      if (result.ok) {
        void navigate({ href: safeRedirect(search.redirect) });
      }
    },
  });

  const errorText = login.data && !login.data.ok ? login.data.error : undefined;

  return (
    <Center mih={"100dvh"} p={"md"}>
      <Box w={360} maw={"100%"}>
        <Stack gap={4} mb={"lg"} align={"center"}>
          <Group gap={8}>
            <Box
              w={22}
              h={22}
              style={{
                borderRadius: 6,
                background: "var(--mantine-color-rezervo-6)",
                boxShadow: "0 0 0 3px var(--mantine-color-rezervo-light)",
              }}
            />
            <Text
              fw={700}
              fz={"lg"}
              style={{
                letterSpacing: "-0.03em",
                fontFamily: "var(--mantine-font-family-monospace)",
              }}
            >
              mirage
            </Text>
          </Group>
          <Text c={"dimmed"} size={"sm"}>
            Logg inn for å administrere testdata.
          </Text>
        </Stack>

        <form
          data-testid={"login-form"}
          onSubmit={(e) => {
            e.preventDefault();
            login.mutate();
          }}
        >
          <Stack>
            <PasswordInput
              data-testid={"admin-password"}
              label={"Passord"}
              placeholder={"Administratorpassord"}
              leftSection={<IconLock size={16} />}
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              required
            />
            {errorText ? (
              <Alert data-testid={"login-error"} color={"red"} variant={"light"} py={"xs"}>
                {errorText}
              </Alert>
            ) : null}
            <Button
              data-testid={"login-submit"}
              type={"submit"}
              loading={login.isPending}
              fullWidth
            >
              Logg inn
            </Button>
          </Stack>
        </form>
      </Box>
    </Center>
  );
}
