import { Box, Button, Group, Stack, Text, Title } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import type { ReactNode } from "react";

export default function PageHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
  children,
}: {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
}) {
  return (
    <Group justify={"space-between"} align={"flex-end"} mb={"lg"} wrap={"wrap"}>
      <Stack gap={2}>
        <Title order={2} fw={650} style={{ letterSpacing: "-0.02em" }}>
          {title}
        </Title>
        {subtitle !== undefined && (
          <Text c={"dimmed"} size={"sm"}>
            {subtitle}
          </Text>
        )}
      </Stack>
      <Box>
        {children}
        {actionLabel !== undefined && onAction !== undefined && (
          <Button
            data-testid={"page-action"}
            leftSection={<IconPlus size={18} />}
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        )}
      </Box>
    </Group>
  );
}
