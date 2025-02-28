import { FileCog, Settings, Wrench } from "lucide-react";
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

export const useFileTreeStore = create<FileTreeState>((set) => ({
  contents: setUpContent(),
  files: [
    {
      id: "24",
      isSelectable: true,
      name: ".env.local",
      fileicon: <FileCog className="w-4 h-4" />,
    },
    {
      id: "34",
      isSelectable: true,
      name: ".env.production",
      fileicon: <FileCog className="w-4 h-4" />,
    },
    {
      id: "44",
      isSelectable: true,
      name: "worm.config.json",
      fileicon: <Settings className="w-4 h-4" />,
    },
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
