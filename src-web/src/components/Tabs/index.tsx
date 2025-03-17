import { X } from "lucide-react";
import { useSidebar } from "../ui/sidebar";
import { FileTree, useFileTreeStore } from "@/hooks/use-filetree";

interface TabProps {
  name: string;
  method: string;
  file: FileTree;
  requestid: string;
}

const Tab = (props: TabProps) => {
  const { setActiveFile, removeTab } = useFileTreeStore();

  return (
    <div
      className="flex items-center px-1 w-[11rem] max-w-[12rem] text-sm rounded-sm h-7 bg-neutral-700/80 dark:bg-primary-foreground/10  group cursor-pointer gap-x-1 border "
      onClick={() => setActiveFile(props.file)}
    >
      <span className="w-8 text-xs text-yellow-300">
        {props.method.toUpperCase()}
      </span>{" "}
      <span className=" w-[100px] truncate text-ellipsis">{props.name}</span>
      <X
        className="h-4 ml-auto text-white rounded-sm bg-black/50 group-hover:block"
        onClick={() => removeTab(props.file.id)}
      />
    </div>
  );
};

const Tabs = () => {
  const { open } = useSidebar();
  const { tabs } = useFileTreeStore();

  return (
    <div
      className={`flex items-center overflow-x-scroll gap-x-3  scrollbar-hide  ${open ? "max-w-[35rem]" : "max-w-[55rem]"}`}
    >
      {tabs.map((item) => {
        return (
          <Tab
            file={item}
            method="http"
            name={item.name}
            requestid={item.id}
            key={crypto.randomUUID()}
          />
        );
      })}
    </div>
  );
};

export default Tabs;
