import {
  CollapseButton,
  File,
  Folder,
  Tree as TreeProvider,
} from "@/components/ui/tree-view-api";
import {
  FileTree as Tree,
  useFileTree,
  useFileTreeActions,
} from "@/hooks/use-filetree";

type SelectEvent = React.MouseEvent<
  HTMLButtonElement | HTMLDivElement,
  MouseEvent
>;

type FileTreeProps = {
  folders: Tree[];
  root_provider?: boolean;
};

const FIleTree = ({
  folders: fileTree,
  root_provider = false,
}: FileTreeProps) => {
  const { setActiveFile } = useFileTreeActions();

  const handleItemSelect = (ev: SelectEvent, item: Tree) => {
    ev.stopPropagation();
    ev.preventDefault();

    // console.log("Type: ", item.path);

    if (item.type === "file") {
      setActiveFile(item);
    }
  };

  const renderTree = (entities: Tree[]) =>
    entities.map((entity) =>
      Array.isArray(entity.children) && entity.children.length > 0 ? (
        <div key={entity.id}>
          <Folder
            element={entity.name}
            value={entity.id}
            onClick={(ev) => handleItemSelect(ev, entity)}
          >
            <FIleTree folders={entity.children} />
          </Folder>
          <CollapseButton elements={entity.children} />
        </div>
      ) : (
        <File
          key={entity.id}
          value={entity.id}
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
      initialSelectedId={fileTree[0]?.id}
      elements={fileTree}
    >
      {renderTree(fileTree)}
    </TreeProvider>
  ) : (
    <>{renderTree(fileTree)}</>
  );
};

export default FIleTree;
