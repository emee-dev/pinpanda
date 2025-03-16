import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { useFileTreeStore } from "@/hooks/use-filetree";
import { Check, FilePlus } from "lucide-react";
import React, { FormEvent, useState } from "react";
import { toast } from "sonner";
import { EnvSwitcher } from "@/components/env-switcher";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FIleTree from "./tree";

const meta = {
  environments: [
    {
      name: "Development",
      logo: Check,
      isSelected: true,
    },
    {
      name: "Testing",
      logo: Check,
      isSelected: false,
    },
    {
      name: "Production",
      logo: Check,
      isSelected: false,
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
    <Sidebar {...props}>
      <SidebarHeader>
        <EnvSwitcher environments={meta.environments} />
      </SidebarHeader>
      <SidebarContent className={open ? "block" : "hidden"}>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center">
            <span className="font-geist">Files</span>
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
              <FIleTree folders={[]} root_provider />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarContent className={open ? "hidden" : "block"} />
      <SidebarRail />
    </Sidebar>
  );
}
