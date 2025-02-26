import { X } from "lucide-react";
import { useSidebar } from "../ui/sidebar";
import { FileTree, useFileTreeStore } from "@/hooks/use-filetree";

interface TabProps {
  method: string;
  requestid: string;
  request_pathname: string;
  file: FileTree;
}

const Tab = (props: TabProps) => {
  const { activeTabs, push, popActiveTab } = useFileTreeStore();

  return (
    <div className="flex items-center px-1 w-[11rem] max-w-[12rem] text-sm rounded-sm h-7 bg-primary-foreground/10  group cursor-pointer gap-x-1 border">
      <span className="text-xs text-yellow-300">
        {props.method.toUpperCase()}
      </span>{" "}
      <span className=" w-[100px] truncate text-ellipsis">
        {props.request_pathname}
      </span>
      <X
        className="h-4 ml-auto bg-black rounded-sm group-hover:block"
        onClick={() => {
          popActiveTab(props.file.id);
        }}
      />
    </div>
  );
};

const Tabs = () => {
  const { open } = useSidebar();
  const { activeTabs } = useFileTreeStore();

  return (
    <div
      className={`flex items-center overflow-x-scroll gap-x-3  scrollbar-hide  ${open ? "max-w-[55rem]" : "max-w-[65rem]"}`}
    >
      {activeTabs.map((item) => {
        return (
          <Tab
            key={crypto.randomUUID()}
            method="POST"
            request_pathname="https://localhost:3000"
            requestid="12"
            file={item}
          />
        );
      })}
    </div>
  );
};

export default Tabs;
