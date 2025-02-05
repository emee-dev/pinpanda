import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  CollapseButton,
  File,
  Folder,
  Tree as TreeProvider,
} from "@/components/ui/tree-view-api";
import { AudioWaveform, Command, GalleryVerticalEnd } from "lucide-react";
import React from "react";

const meta = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "development",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "testing",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "production",
      logo: Command,
      plan: "Free",
    },
  ],
};

type FileTree = {
  id: string;
  name: string;
  isSelectable: boolean;
  children?: FileTree[];
};

const elements: FileTree[] = [
  {
    id: "1",
    isSelectable: true,
    name: "src",
    children: [
      {
        id: "2",
        isSelectable: true,
        name: "app.tsx",
      },
      {
        id: "3",
        isSelectable: true,
        name: "components",
        children: [
          {
            id: "20",
            isSelectable: true,
            name: "pages",
            children: [
              {
                id: "21",
                isSelectable: false,
                name: "interface.ts",
              },
            ],
          },
        ],
      },
      {
        id: "6",
        isSelectable: true,
        name: "ui",
        children: [
          {
            id: "7",
            isSelectable: true,
            name: "carousel.tsx",
          },
        ],
      },
    ],
  },
  {
    id: "100",
    isSelectable: true,
    name: "node_modules",
    children: [],
  },
  {
    id: "29",
    isSelectable: true,
    name: ".env.development",
  },
  {
    id: "24",
    isSelectable: true,
    name: ".env.local",
  },
  {
    id: "34",
    isSelectable: true,
    name: ".env.production",
  },
  {
    id: "44",
    isSelectable: true,
    name: "worm.config.json",
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { open } = useSidebar();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={meta.teams} />
      </SidebarHeader>
      <SidebarContent className={open ? "block" : "hidden"}>
        <SidebarGroup>
          <SidebarGroupLabel>Files</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <Tree folders={elements} root_provider />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {/* Just an empty content */}
      <SidebarContent className={open ? "hidden" : "open"} />

      <SidebarFooter>
        <NavUser user={meta.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

const Tree = ({
  folders,
  root_provider = false,
}: {
  folders: FileTree[];
  root_provider?: boolean;
}) => {
  const handleItemSelect = (
    e: React.MouseEvent<HTMLButtonElement | HTMLDivElement, MouseEvent>,
    item: FileTree
  ) => {
    e.stopPropagation();
    e.preventDefault();
    console.log(item.name);
  };

  const renderTree = (entities: FileTree[]) =>
    entities.map((entity) =>
      entity.children ? (
        <div key={entity.id}>
          <Folder
            element={entity.name}
            value={`${entity.name}_${entity.id}`}
            onClick={(e) => handleItemSelect(e, entity)}
          >
            <Tree folders={entity.children} />
          </Folder>
          <CollapseButton elements={entity.children} />
        </div>
      ) : (
        <File
          key={entity.id}
          value={`${entity.name}_${entity.id}`}
          onClick={(e) => handleItemSelect(e, entity)}
        >
          <p>{entity.name}</p>
        </File>
      )
    );

  return root_provider ? (
    <TreeProvider
      className="p-2 overflow-hidden rounded-md h-60 bg-background"
      initialSelectedId="carousel.tsx_7"
      elements={folders}
    >
      {renderTree(folders)}
    </TreeProvider>
  ) : (
    <>{renderTree(folders)}</>
  );
};
