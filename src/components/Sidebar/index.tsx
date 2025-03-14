import { TeamSwitcher } from "@/components/team-switcher";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
} from "lucide-react";
import React, { FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const { createFile, addNewTab, setActiveFile } = useFileTreeStore();
  const [dialogOpen, dialogOpenChange] = useState(false);

  const handleFormSubmit = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();

    let form = new FormData(ev.currentTarget);

    let file_name = form.get("file_name") as string;

    if (!file_name.trim()) {
      return toast("Error creating a new file.", {
        description: "Please provide a valid filename with ext (.toml)",
      });
    }

    const fileId = crypto.randomUUID();

    const file = {
      id: fileId,
      isSelectable: true,
      name: file_name.trim() + ".toml",
      content: `[get]\nname = "get all products"\nurl = "your_api_url"`,
    };

    createFile({
      id: file.id,
      name: file.name,
      type: "file",
      content: file.content,
      parentId: undefined,
      isSelectable: true,
    });

    // Inserts a new tab
    addNewTab({
      id: file.id,
      type: "file",
      name: file.name,
      content: file.content,
      isSelectable: true,
    });

    setActiveFile({
      id: file.id,
      type: "file",
      name: file.name,
      content: file.content,
      isSelectable: true,
    });

    dialogOpenChange(false);
  };

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
                    onSubmit={(ev) => handleFormSubmit(ev)}
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
      <SidebarContent className={open ? "hidden" : "block"} />

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
  root_provider = false,
}: {
  folders: FileTree[];
  root_provider?: boolean;
}) => {
  const { fileTree, addNewTab, setActiveFile } = useFileTreeStore();
  const handleItemSelect = (ev: SelectEvent, item: FileTree) => {
    ev.stopPropagation();
    ev.preventDefault();

    addNewTab(item);
    setActiveFile(item);
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
      elements={fileTree}
    >
      {renderTree(fileTree)}
    </TreeProvider>
  ) : (
    <>{renderTree(fileTree)}</>
  );
};
