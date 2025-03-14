import { create } from "zustand";

type Item = {
  id: string;
  item_name: string;
  type: "file" | "folder";
  content?: string | null;
  children?: Item[] | null;
  parentId?: string;
};

type FileTree = Item;

type File = string;
type FileItem = Pick<Item, "id" | "item_name" | "content">;
type ActiveFile = Pick<Item, "id" | "item_name" | "content">;
type Tab = Pick<Item, "id" | "item_name" | "content">;

type FileTreeState = {
  tabs: Tab[];
  activeFile: ActiveFile | null;
  fileTree: FileTree[];
  fileContents: Map<string, File>;
  createFile: (file: FileTree) => void;
  removeFile: (file: FileTree) => void;
  editFileById: (fileId: string, args: File) => void;
  // Tabs
  insertTab: (file: ActiveFile) => void;
  removeTab: (fileId: string) => void;
  setActiveTab: (file: ActiveFile) => void;
  // Editor
  setFileContent: (fileId: string, content: string) => void;
  // getFile: (fileId: string) => void;
};

const items: FileTree[] = [
  {
    id: "1",
    item_name: "transactions",
    type: "folder",
    children: [
      {
        id: "3",
        item_name: "get transactions.toml",
        type: "file",
      },
      {
        id: "4",
        item_name: "delete transactions.toml",
        type: "file",
      },
      {
        id: "5",
        item_name: "banking",
        type: "file",
      },
    ],
  },
  {
    id: "2",
    item_name: "get products.toml",
    type: "file",
  },
];

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

let add = traverse(items, {
  // parentId: "1",
  operation: "add",
  data: {
    id: "4",
    item_name: "spacial.toml",
    type: "file",
  },
});

let ops = traverse(add, {
  // parentId: "2",
  operation: "remove",
  data: {
    id: "2",
  },
});

console.dir(ops, { depth: Infinity });

export const useFileTreeStore = create<FileTreeState>((set) => ({
  tabs: [],
  fileTree: [],
  activeFile: null,
  fileContents: new Map<string, File>(),
  // Filetree
  createFile: (file: Item) =>
    set((state) => {
      const tree = state.fileTree;

      const ops = traverse(tree, {
        parentId: file.parentId,
        operation: "add",
        data: file,
      });

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
  editFileById: (fileId, args) =>
    set((state) => {
      let previousMap = state.fileContents;

      let file = previousMap.set(fileId, args);

      return { fileContents: file };
    }),

  // Tabs
  setActiveTab: (file) => set((state) => ({ activeFile: file })),
  insertTab: (file) =>
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
  setFileContent: (fileId, content) =>
    set((state) => {
      const previousMap = state.fileContents;

      let map = previousMap.set(fileId, content);

      return { fileContents: map };
    }),
  // getFile: (fileId) =>
  //   set((state) => {
  //     const contentMap = state.fileContents;

  //     let content = contentMap.get(fileId);

  //     if (!content) {
  //       return null;
  //     }

  //     return content;
  //   }),
}));
