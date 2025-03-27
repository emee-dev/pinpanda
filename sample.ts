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

type FileTree = {
  id: string;
  name: string;
  //   type: "file" | "folder";
  //   isSelectable: boolean;
  content?: string | null;
  children?: FileTree[];
  //   parentId?: string;
  //   fileicon?: any;
};

type ContentMap = Map<string, string>;

const fileTree: FileTree[] = [
  {
    id: "1",
    name: "get_products.toml",
    content: "[get] products.url",
  },
  {
    id: "2",
    name: "delete_products.toml",
    content: "[delte] products.url",
  },
  {
    id: "3",
    name: "users",
    children: [
      {
        id: "4",
        name: "get_users.toml",
        content: "[get] users.url",
      },
      {
        id: "5",
        name: "post_users.toml",
        content: "[post] users.url",
      },
    ],
  },
];

const traverse = (
  items: FileTree[],
  args: {
    parentId?: string;
    operation: "add" | "remove";
    data: Partial<FileTree>;
  }
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

const moveContentsToMap = (items: FileTree[], map: ContentMap = new Map()) => {
  for (const item of items) {
    if (item.children) {
      moveContentsToMap(item.children, map);
    } else {
      map.set(item.id, item.content as string);
      //   item.content = undefined;
      delete item.content;
    }
  }

  return { items, map };
};

let { items, map } = moveContentsToMap(fileTree);
// console.log(map.entries());
console.dir(items, { depth: Infinity });
