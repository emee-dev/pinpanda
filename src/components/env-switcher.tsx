import { Box } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Separator } from "./ui/separator";

export function EnvSwitcher({
  environments,
}: {
  environments: {
    name: string;
    logo: React.ElementType;
    isSelected?: boolean;
  }[];
}) {
  const { isMobile } = useSidebar();
  const [activeEnv, setActiveEnv] = useState(environments[0]);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent border data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex items-center justify-center rounded-lg aspect-square size-8 text-sidebar-primary-foreground">
                <img src="/panda.png" className=" size-9" />
              </div>
              <div className="grid flex-1 text-sm leading-tight text-left">
                <span className="font-semibold truncate">{activeEnv.name}</span>
                {/* <span className="text-xs truncate">{activeEnv.plan}</span> */}
              </div>
              {/* <ChevronsUpDown className="ml-auto" /> */}
              <Box className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            {environments.map((env, index) => (
              <DropdownMenuItem
                key={env.name}
                onClick={() => setActiveEnv(env)}
                className="gap-2 p-2"
              >
                {env.isSelected && (
                  <div className="flex items-center justify-center rounded-sm size-6">
                    <env.logo className="size-4 shrink-0" />
                  </div>
                )}

                {!env.isSelected && (
                  <div className="flex items-center justify-center rounded-sm size-6"></div>
                )}
                {env.name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuLabel className="flex items-center text-xs text-muted-foreground">
              Environments
              <Separator orientation="horizontal" className="w-full ml-2" />
            </DropdownMenuLabel>
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex items-center justify-center rounded-md size-6 bg-background">
                <Box className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">
                Manage Environments
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
