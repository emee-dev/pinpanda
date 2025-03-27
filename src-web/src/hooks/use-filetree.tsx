import { create } from "zustand";

export type FileTree = {
  id: string;
  name: string;
  type: "file" | "folder";
  isSelectable: boolean;
  path: string;
  content?: string | null;
  children?: FileTree[];
  parentId?: string;
  // TODO remove this fileicon property
  // Sidebar will infer the file type and display the appropriate icon
  fileicon?: any;
};

export type PandaCollection = {
  id: string;
  name: string;
  path: string;
  content: string | undefined;
  children: PandaCollection[] | undefined;
  isSelectable: boolean;
  type: "file" | "folder";
};

type ContentMap = Map<string, string>;

type File = string;
type ActiveFile = Pick<
  FileTree,
  "id" | "name" | "content" | "type" | "fileicon" | "isSelectable"
>;

type FileTreeActions = {
  hasConfiguredProjectRoot: (val: boolean) => void;
  createFile: (file: FileTree) => void;
  removeFile: (file: FileTree) => void;

  // Init
  initFileTree: (files: FileTree[]) => void;

  // Editor
  setActiveFile: (file: ActiveFile) => void;
  updateFileContentById: (fileId: string, args: File) => void;
};

type FileTreeState = {
  hasSetProjectRoot: boolean;
  fileTree: FileTree[];
  activeFile: ActiveFile | null;
  fileContents: Map<string, File>;
  actions: FileTreeActions;
};

type TreeTraversal = {
  parentId?: string;
  operation: "add" | "remove";
  data: Partial<FileTree>;
};

const editTree = (items: FileTree[], args: TreeTraversal) => {
  if (items.length <= 0) {
    return [];
  }

  // Top level items without a parent id
  if (args?.parentId === undefined) {
    if (args.operation === "add") {
      // items = [...items, args.data as any];
      items.push(args.data as any);
    }

    if (args.operation === "remove") {
      items = items.filter((file) => file.id !== args.data.id);
    }
  }

  for (const item of items) {
    if (item.children && Array.isArray(item.children)) {
      if (item.id === args?.parentId) {
        if (args.operation === "add") {
          // item.children = [...item.children, args.data as any];
          item.children.push(args.data as any);
        }
        if (args.operation === "remove") {
          item.children = item.children.filter(
            (file) => file.id !== args.data.id
          );
        }
      }

      editTree(item.children, args);
    }
  }

  return items;
};

/**
 * Moves the content property from each object to a centralized map
 * where it is much easier to manipulate.
 * @param items
 * @param map
 * @returns
 *
 */
const moveContentsToMap = (items: FileTree[], map: ContentMap = new Map()) => {
  for (const item of items) {
    if (item.children && Array.isArray(item.children)) {
      moveContentsToMap(item.children, map);
    } else {
      map.set(item.id, item.content as string);
      delete item.content;
    }
  }

  return { items, map };
};

export const useFileTree = create<FileTreeState>((set) => ({
  fileTree: [],
  hasSetProjectRoot: false,
  activeFile: null,
  fileContents: new Map(),
  actions: {
    hasConfiguredProjectRoot: (val) => set((_) => ({ hasSetProjectRoot: val })),
    // Filetree
    // TODO Refactor this to create a file using the folder path
    // instead of parentId, if parentId is not found then file will
    // be created at collection root.
    createFile: (file: FileTree) =>
      set((state) => {
        const tree = state.fileTree;
        const previousMap = state.fileContents;

        const ops = editTree(tree, {
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
    removeFile: (file: FileTree) =>
      set((state) => {
        let tree = state.fileTree;
        let previousMap = state.fileContents;

        let ops = editTree(tree, {
          parentId: file.parentId,
          operation: "remove",
          data: { id: file.id },
        });

        let isDeleted = previousMap.delete(file.id);

        if (isDeleted) {
          return { fileTree: ops, fileContents: previousMap };
        }

        return { fileTree: ops };
      }),

    // Init
    initFileTree: (files) =>
      set((state) => {
        let { items, map } = moveContentsToMap(files);

        // TODO recurse the files[] and remove content from each object
        // simply moving each content to the content map.

        return { fileTree: items, fileContents: map, hasSetProjectRoot: true };
      }),

    // Tabs
    setActiveFile: (file) =>
      set((state) => {
        let content = state.fileContents.get(file.id) || "";

        return { activeFile: { ...file, content } };
      }),

    // Editor
    updateFileContentById: (fileId, args) =>
      set((state) => {
        let previousMap = state.fileContents;

        let file = previousMap.set(fileId, args);

        return { fileContents: file };
      }),
  },
}));

export const useFileTreeActions = () => useFileTree((state) => state.actions);
