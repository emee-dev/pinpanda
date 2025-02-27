import { create } from "zustand";

export type FileTree = {
  id: string;
  name: string;
  isSelectable: boolean;
  fileicon?: React.ReactNode;
  children?: FileTree[];
};

type FileTreeState = {
  files: FileTree[];
  activeTabs: FileTree[];
  contents: Map<string, string>;
  currentFile: FileTree | null;
  push: (file: FileTree) => void;
  setCurrent: (fileId: string) => void;
  pushActiveTab: (file: FileTree) => void;
  popActiveTab: (fileId: string) => void;
};

const setUpContent = () => {
  const map = new Map();

  const arr = [
    { id: "29", content: `API_KEY=123\nOPENAPI="api_key123"` },
    { id: "24", content: `BASE_URL="localhost:3000/api"\nAPI_KEY=900` },
    {
      id: "34",
      content: `BASE_URL="https://api.vercel.com/api"\nAPI_KEY="custom_api"`,
    },
    { id: "44", content: `null` },
  ];

  arr.forEach((item) => map.set(item.id, item.content));

  return map;
};

export const useFileTreeStore = create<FileTreeState>((set) => ({
  // fileContents: new Map<string, string>(),
  contents: setUpContent(),
  files: [
    { id: "29", isSelectable: true, name: ".env.development" },
    { id: "24", isSelectable: true, name: ".env.local" },
    { id: "34", isSelectable: true, name: ".env.production" },
    { id: "44", isSelectable: true, name: "worm.config.json" },
  ],
  activeTabs: [],
  currentFile: null,
  push: (file) => set((state) => ({ files: [...state.files, file] })),
  setCurrent: (fileId) =>
    set((state) => ({
      currentFile: state.files.find((file) => file.id === fileId) || null,
    })),
  pushActiveTab: (file) =>
    set((state) => {
      const isAnExistingFile = state.activeTabs.find(
        (item) => item.id === file.id
      );

      if (isAnExistingFile) {
        return state;
      }

      return { activeTabs: [...state.activeTabs, file] };
    }),
  popActiveTab: (fileId) =>
    set((state) => ({
      activeTabs: state.activeTabs.filter((a) => a.id !== fileId),
    })),
}));
