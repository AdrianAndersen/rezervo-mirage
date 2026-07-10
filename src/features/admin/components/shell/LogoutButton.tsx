import { ActionIcon, Tooltip } from "@mantine/core";
import { IconLogout } from "@tabler/icons-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { authStatusQuery, logoutFn } from "@/features/admin/server/auth";

/** Log out control. Hidden when auth is disabled (dev/CI), where it is a no-op. */
export default function LogoutButton() {
  const navigate = useNavigate();
  const { data } = useQuery(authStatusQuery());
  const logout = useMutation({
    mutationFn: () => logoutFn(),
    onSuccess: () => navigate({ to: "/login" }),
  });

  if (data?.authDisabled !== false) {
    return null;
  }

  return (
    <Tooltip label={"Logg ut"}>
      <ActionIcon
        data-testid={"logout"}
        variant={"subtle"}
        color={"gray"}
        size={"lg"}
        aria-label={"Logg ut"}
        loading={logout.isPending}
        onClick={() => logout.mutate()}
      >
        <IconLogout size={20} />
      </ActionIcon>
    </Tooltip>
  );
}
