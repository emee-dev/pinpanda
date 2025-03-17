import { FileCog, Settings } from "lucide-react";
import { create } from "zustand";

const configContent = `
# There is no config for now, but it should look like this.
{
  "$schema": "https://demoapi.dev/schema.json",
  "version": "v1",
  "project_name": "Stripe API",
  "collection_folder": "./some_path/collections"
}
`;

const dotenvContent = `
# There will be dotenv support - (coming soon)
BASEURL = "http://localhost:3000/api"
API_KEY = $BASE_URL
`;

const setUpContent = () => {
  const map = new Map();

  const arr = [
    { id: "24", content: dotenvContent },
    {
      id: "34",
      content: `BASE_URL="https://api.vercel.com/api"\nAPI_KEY="custom_api"`,
    },
    { id: "44", content: configContent },
  ];

  arr.forEach((item) => map.set(item.id, item.content));

  return map;
};

type Item = {
  id: string;
  name: string;
  type: "file" | "folder";
  content?: string | null;
  children?: Item[];
  parentId?: string;
  fileicon?: React.ReactNode;
  isSelectable: boolean;
};

export type FileTree = Item;

type File = string;
type ActiveFile = Pick<
  Item,
  "id" | "name" | "content" | "type" | "fileicon" | "isSelectable"
>;
type Tab = Pick<
  Item,
  "id" | "name" | "content" | "type" | "fileicon" | "isSelectable"
>;

type FileTreeState = {
  tabs: Tab[];
  activeFile: ActiveFile | null;
  fileTree: FileTree[];
  fileContents: Map<string, File>;
  createFile: (file: FileTree) => void;
  removeFile: (file: FileTree) => void;

  // Tabs
  addNewTab: (file: ActiveFile) => void;
  removeTab: (fileId: string) => void;
  setActiveFile: (file: ActiveFile) => void;

  // Editor
  updateFileContentById: (fileId: string, args: File) => void;
};

const traverse = (
  items: FileTree[],
  args: { parentId?: string; operation: "add" | "remove"; data: Partial<Item> }
) => {
  if (items.length <= 0) {
    return [];
  }

  // Top level items without a parent id
  if (args?.parentId === undefined) {
    if (args.operation === "add") {
      items = [...items, args.data as any];
    }

    if (args.operation === "remove") {
      items = items.filter((file) => file.id !== args.data.id);
    }
  }

  for (const item of items) {
    if (item.children && Array.isArray(item.children)) {
      if (item.id === args?.parentId) {
        if (args.operation === "add") {
          item.children = [...item.children, args.data as any];
        }
        if (args.operation === "remove") {
          item.children = item.children.filter(
            (file) => file.id !== args.data.id
          );
        }
      }

      traverse(item.children, args);
    }
  }

  return items;
};

export const useFileTreeStore = create<FileTreeState>((set) => ({
  tabs: [],
  fileTree: [
    {
      id: "24",
      isSelectable: true,
      name: ".env.local",
      fileicon: <FileCog className="w-4 h-4" />,
      type: "file",
    },
    {
      id: "34",
      isSelectable: true,
      name: ".env.production",
      fileicon: <FileCog className="w-4 h-4" />,
      type: "file",
    },
    {
      id: "44",
      isSelectable: true,
      name: "worm.config.json",
      fileicon: <Settings className="w-4 h-4" />,
      type: "file",
    },
  ],
  activeFile: null,
  fileContents: setUpContent(),
  // Filetree
  createFile: (file: Item) =>
    set((state) => {
      const tree = state.fileTree;
      const previousMap = state.fileContents;

      const ops = traverse(tree, {
        parentId: file.parentId,
        operation: "add",
        data: file,
      });

      if (file.content) {
        let map = previousMap.set(file.id, file.content);

        return { fileTree: ops, fileContents: map };
      }

      return { fileTree: ops };
    }),
  removeFile: (file: Item) =>
    set((state) => {
      let tree = state.fileTree;

      let ops = traverse(tree, {
        parentId: file.parentId,
        operation: "remove",
        data: { id: file.id },
      });

      return { fileTree: ops };
    }),

  // Tabs
  setActiveFile: (file) =>
    set((state) => {
      let content = state.fileContents.get(file.id) || "";

      return { activeFile: { ...file, content } };
    }),
  addNewTab: (file) =>
    set((state) => {
      const previousTabs = state.tabs;

      if (previousTabs.find((tab) => tab.id === file.id)) {
        return { tabs: previousTabs };
      }

      return { tabs: [...previousTabs, file] };
    }),
  removeTab: (fileId) =>
    set((state) => {
      const previousTabs = state.tabs;

      const filter = previousTabs.filter((tab) => tab.id !== fileId);

      return { tabs: filter };
    }),

  // Editor
  updateFileContentById: (fileId, args) =>
    set((state) => {
      let previousMap = state.fileContents;

      let file = previousMap.set(fileId, args);

      return { fileContents: file };
    }),
}));
