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
import { FileTree, useFileTreeStore } from "@/hooks/use-filetree";
import {
  AudioWaveform,
  Command,
  FilePlus,
  GalleryVerticalEnd,
  Plus,
} from "lucide-react";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DropdownMenuLabel } from "./ui/dropdown-menu";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { Label } from "./ui/label";
import { Button } from "./ui/button";

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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { open } = useSidebar();
  const { push, contents, setCurrent, pushActiveTab } = useFileTreeStore();
  const [dialogOpen, dialogOpenChange] = useState(false);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={meta.teams} />
      </SidebarHeader>
      <SidebarContent className={open ? "block" : "hidden"}>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center">
            Files{" "}
            <div className="ml-auto">
              <Dialog open={dialogOpen} onOpenChange={dialogOpenChange}>
                <DialogTrigger asChild>
                  <FilePlus className="h-4" />
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Create New File</DialogTitle>
                    <DialogDescription>
                      Enter a name for your new file.
                    </DialogDescription>
                  </DialogHeader>
                  <form
                    className="grid gap-4 py-4"
                    onSubmit={(ev) => {
                      ev.preventDefault();

                      let form = new FormData(ev.currentTarget);

                      let file_name = form.get("file_name") as string;

                      if (!file_name.trim()) {
                        return toast("Error creating a new file.", {
                          description:
                            "Please provide a valid filename with ext (.toml)",
                        });
                      }

                      const fileId = crypto.randomUUID();

                      contents.set(
                        fileId,
                        `[get]\nname="get all products"\nurl="your_api_url"`
                      );

                      const file = {
                        id: fileId,
                        isSelectable: true,
                        name: file_name.trim() + ".toml",
                      };

                      push(file);

                      setCurrent(fileId);
                      pushActiveTab(file);
                      dialogOpenChange(false);
                    }}
                  >
                    <div className="grid gap-2">
                      <Label htmlFor="file_name">Filename</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="file_name"
                          name="file_name"
                          placeholder="Enter filename"
                          className="flex-1"
                          autoFocus
                        />
                        <div className="text-sm font-medium text-muted-foreground">
                          {".toml"}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => dialogOpenChange(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">Create</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <Tree folders={[]} root_provider />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {/* Just an empty content */}
      <SidebarContent className={open ? "hidden" : "open"} />

      <SidebarFooter>{/* <NavUser user={meta.user} /> */}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

type SelectEvent = React.MouseEvent<
  HTMLButtonElement | HTMLDivElement,
  MouseEvent
>;

const Tree = ({
  folders,
  root_provider = false,
}: {
  folders: FileTree[];
  root_provider?: boolean;
}) => {
  const { files, pushActiveTab, setCurrent } = useFileTreeStore();
  const handleItemSelect = (e: SelectEvent, item: FileTree) => {
    e.stopPropagation();
    e.preventDefault();

    pushActiveTab(item);
    setCurrent(item.id);
  };

  const renderTree = (entities: FileTree[]) =>
    entities.map((entity) =>
      entity.children ? (
        // TODO handle folders
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
          fileIcon={entity.fileicon}
        >
          <p>{entity.name}</p>
        </File>
      )
    );

  return root_provider ? (
    <TreeProvider
      className="p-2 overflow-hidden rounded-md h-60 bg-background"
      initialSelectedId="carousel.tsx_7"
      elements={files}
    >
      {renderTree(files)}
    </TreeProvider>
  ) : (
    <>{renderTree(files)}</>
  );
};
