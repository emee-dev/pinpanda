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
  currentFile: FileTree | null;
  push: (file: FileTree) => void;
  setCurrent: (fileId: string) => void;
  getSelectedfile: (fileId: string) => void;
  pushActiveTab: (file: FileTree) => void;
  popActiveTab: (fileId: string) => void;
};

export const useFileTreeStore = create<FileTreeState>((set) => ({
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

  getSelectedfile: (fileId) => {},
  pushActiveTab: (file) =>
    set((state) => ({ activeTabs: [...state.activeTabs, file] })),
  popActiveTab: (fileId) =>
    set((state) => ({
      activeTabs: state.activeTabs.filter((a) => a.id !== fileId),
    })),
}));
