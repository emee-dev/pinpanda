import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

const env = import.meta.env.MODE;

export const Route = createRootRoute({
  component: () => (
    <>
      {/* <hr /> */}
      <Outlet />
      {env === "development" && <TanStackRouterDevtools />}
    </>
  ),
});
