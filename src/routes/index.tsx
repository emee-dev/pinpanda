import CodeEditor from "@/components/Editor";
import { AppSidebar } from "@/components/Sidebar";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useFileTreeStore } from "@/hooks/use-filetree";
import { formatTOMl } from "@/lib/toml";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { invoke } from "@tauri-apps/api/core";
import {
  Cookie,
  Dot,
  Loader,
  Maximize,
  Minus,
  PlusCircle,
  SendIcon,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { parse, stringify } from "smol-toml";
import { toast } from "sonner";
import JsonViewer from "@/components/ResponseViewers/JsonViewer";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { NavActions } from "@/components/nav_actions";

export const Route = createFileRoute("/")({
  component: Index,
});

const code = `
[post]
name = "Get User Info"
url = "https://postman-echo.com/post"

[post.query]
name = "emmanuel"
limit = 20
page = 1

# [post.json]
# content = """
# {"user": "123"}
# """

# [post.form_multipart]
# content = [
#     { field = "username", value = "wormclient" },
#     { field = "description", value = "This is the best api client." },
#     # { field = "avatar", value = "./some_file (coming soon)." },
# ]

[post.text]
content = """
Hello friends
"""

[post.headers]
"Authorization" = "Bearer 123"
"Content-Type" = "application/json"
x-redis-ratelimit = "2000"
`;

type Response = {
  status: number;
  headers: Record<string, unknown> | null;
  text_response: string | null;
  elapsed_time: number;
  content_type: string;
};

const isJsonStr = <T extends string | null>(str: T) => {
  try {
    if (!str) return false;
    if (typeof str === "undefined") return false;

    JSON.parse(str);
    return true;
  } catch (error) {
    return false;
  }
};

// const changeWorkingDir = async () => {
//   const pickFolder = await open({
//     multiple: false,
//     directory: true,
//   });

//   const set_folder = await invoke("cmd_update_cwd", {
//     curr_dir: pickFolder,
//   });
// };

type PandaCollections = {
  item_name: string;
  item_path: string;
  item_content: string;
};

const getAppMode = async () => {
  // let res = (await invoke("get_app_mode")) as "cli_gui" | "desktop_gui";
  const collections = (await invoke("get_collections", {
    cwd: `C:\\Users\\DELL\\Desktop\\Panda collections`,
  })) as PandaCollections[];
  // console.log("App Mode: ", res);
  console.log("collections ", JSON.stringify(collections, null, 3));
};

function Index() {
  const [response, setResponse] = useState({ code: {}, lang: "json" });
  const { theme } = useTheme();
  const [tomlCode, setToml] = useState("");
  const [disableSend, setDisableSend] = useState(false);
  const { mutate, isPending, error, data } = useMutation<Response>({
    mutationKey: [""],
    mutationFn: async () => {
      try {
        const parsed = parse(tomlCode) as any;

        const formatted_toml = formatTOMl(parsed as any);

        const toml = stringify(formatted_toml);

        const request = (await invoke("cmd_http_request", {
          toml_schema: toml,
        })) as Response;

        return Promise.resolve(request);
      } catch (error: any) {
        const msg = error.message
          ? error.message
          : "Something went wrong. Please try again.";

        toast("An error occurred", {
          description: typeof error === "string" ? error : msg,
          action: {
            label: "Retry",
            onClick: () => mutate(),
          },
        });
        console.log("Error:", error);
        return Promise.reject(error);
      }
    },
  });

  const appWindow = getCurrentWindow();

  const { createFile, activeFile, updateFileContentById } = useFileTreeStore();

  // Initializes a demo file
  useEffect(() => {
    const fileId = crypto.randomUUID();

    createFile({
      id: fileId,
      name: "syntax_demo.toml",
      type: "file",
      content: code.trim(),
      isSelectable: true,
    });
  }, []);

  // Sets the current file
  useEffect(() => {
    if (activeFile) {
      setToml(activeFile.content as string);
    }
  }, [activeFile]);

  // Updates file content when code editor content changes
  useEffect(() => {
    const editorCode = tomlCode?.trim();

    if (editorCode && activeFile) {
      updateFileContentById(activeFile.id, editorCode);
    }
  }, [tomlCode, activeFile]);

  // Handle send button state
  useEffect(() => {
    if (activeFile) {
      if (!activeFile.name.endsWith(".toml")) {
        setDisableSend(true);
        return;
      }

      setDisableSend(false);
    } else {
      setDisableSend(true);
    }
  }, [activeFile]);

  useEffect(() => {
    if (data) {
      console.log("data", data);

      const response = data.text_response;
      if (!isJsonStr(response)) {
        return setResponse({
          code: response as string,
          lang: "text",
        });
      }

      setResponse({
        code: JSON.parse(response as string),
        lang: "json",
      });
    }
  }, [data]);

  return (
    <SidebarProvider
      defaultOpen={false}
      className="w-full overflow-hidden scrollbar-hide"
    >
      <AppSidebar collapsible="icon" className="" />

      <SidebarInset className="overflow-hidden">
        <header className="flex items-center h-10 pb-1 border-b shrink-0">
          <div
            data-tauri-drag-region
            className="fixed flex items-center w-full pl-2"
          >
            <div className="flex items-center">
              <SidebarTrigger className="" />
              <Separator orientation="vertical" className="h-4" />
            </div>
            <div className="ml-2">
              <Button variant="ghost" size="icon" className=" size-7">
                <PlusCircle className="h-4" />
                <span className="sr-only">New request</span>
              </Button>
            </div>
            <div className="ml-2">
              <Button variant="ghost" size="icon" className=" size-7">
                <Cookie className="h-4" />
                <span className="sr-only">Cookies</span>
              </Button>
            </div>
            <div className="ml-2">
              {/* <Button variant="ghost" size="icon" className=" size-7">
                <Cookie className="h-4" />
                <span className="sr-only">Cookies</span>
              </Button> */}
              <NavActions />
            </div>
          </div>

          <div className="fixed flex items-center h-10 right-2 gap-x-4">
            <div className="flex items-center [&>*]:size-[44px] [&>*]:flex [&>*]:items-center [&>*]:justify-center ">
              <div
                onClick={() => appWindow.minimize()}
                className="hover:bg-muted-foreground/50"
              >
                <Minus className="h-4" />
              </div>
              <div
                onClick={() => appWindow.toggleMaximize()}
                className="hover:bg-muted-foreground/50"
              >
                <Maximize className="h-4" />
              </div>
              <div
                onClick={() => appWindow.close()}
                className="hover:bg-red-500 "
              >
                <X className="h-4" />
              </div>
            </div>
          </div>
        </header>

        <section className="relative flex flex-1 overflow-scroll scrollbar-hide">
          <div className="absolute grid grid-cols-1 gap-2 px-2 pb-3 mt-1 overflow-hidden size-full md:grid-cols-2">
            <div className="flex flex-col mt-2 gap-y-3 font-geist">
              <div className=" w-full h-[28px] flex">
                <Button
                  size="icon"
                  className="ml-auto h-7 disabled:bg-neutral-400"
                  disabled={disableSend}
                  onClick={() => mutate()}
                  // variant="outline"
                >
                  <SendIcon />
                </Button>
              </div>

              {/* TODO when request panel is clicked use ref to focus the editor */}
              <div className="relative border border-black/30 rounded-sm w-full overflow-scroll h-[calc(100%-28px)] scrollbar-hide">
                <CodeEditor
                  defaultText={tomlCode}
                  onChange={(val) => setToml(val)}
                  className="w-full"
                />
              </div>
            </div>

            <div
              className={` ${theme === "dark" ? "[--rjv_object_key:white]" : "[--rjv_object_key:black]  "} mt-1 px-2 border border-black/30  shadow-sm rounded-md relative overflow-scroll scrollbar-hide ${isPending ? "flex justify-center" : "block"}`}
            >
              {data && (
                <div className="absolute font-poppins text-base top-0 flex items-center w-[calc(100%-15px)] mt-1 rounded-sm ">
                  <div className="flex items-center text-green-500">
                    <span className="text-sm ">
                      {data.status} {data.status === 200 ? "OK" : ""}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Dot className="h-7" />
                    <span className="text-sm ">{data.elapsed_time}ms</span>
                  </div>
                </div>
              )}

              {!isPending && (
                // TODO refactor to use different response viewers
                <JsonViewer
                  code={response.code}
                  lang={response.lang}
                  style={{
                    marginTop: data ? "30px" : "0px",
                  }}
                />
              )}

              {isPending && (
                <div className="flex flex-col items-center gap-y-2 mt-[60px]">
                  <Loader className="animate-spin " />
                  <span className="text-neutral-500">Please wait...</span>
                </div>
              )}
            </div>
          </div>
        </section>
      </SidebarInset>
    </SidebarProvider>
  );
}
