import {
  CollapseButton,
  File,
  Folder,
  Tree as TreeProvider,
} from "@/components/ui/tree-view-api";
import { FileTree as tree, useFileTreeStore } from "@/hooks/use-filetree";

type SelectEvent = React.MouseEvent<
  HTMLButtonElement | HTMLDivElement,
  MouseEvent
>;

type FileTreeProps = {
  folders: tree[];
  root_provider?: boolean;
};

const FIleTree = ({ root_provider = false }: FileTreeProps) => {
  const { fileTree, addNewTab, setActiveFile } = useFileTreeStore();
  const handleItemSelect = (ev: SelectEvent, item: tree) => {
    ev.stopPropagation();
    ev.preventDefault();

    addNewTab(item);
    setActiveFile(item);
  };

  const renderTree = (entities: tree[]) =>
    entities.map((entity) =>
      entity.children ? (
        // TODO handle folders
        <div key={entity.id}>
          <Folder
            element={entity.name}
            value={`${entity.name}_${entity.id}`}
            onClick={(e) => handleItemSelect(e, entity)}
          >
            <FIleTree folders={entity.children} />
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

export default FIleTree;
