import CodeEditor from "@/components/Editor";
import { NavActions } from "@/components/nav_actions";
import JsonViewer from "@/components/ResponseViewers/JsonViewer";
import { AppSidebar } from "@/components/Sidebar";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  PandaCollection,
  useFileTree,
  useFileTreeActions,
} from "@/hooks/use-filetree";
import { formatTOMl } from "@/lib/toml";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, ErrorComponentProps } from "@tanstack/react-router";
import { invoke } from "@tauri-apps/api/core";
import { emit } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { EditorView } from "codemirror";
import { open } from "@tauri-apps/plugin-dialog";
import {
  ChevronDown,
  Cookie,
  Dot,
  FolderOpen,
  Loader,
  Maximize,
  Minus,
  PlusCircle,
  RefreshCcw,
  SendIcon,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { parse, stringify } from "smol-toml";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  errorComponent: (err) => <ErrorState error={err} reset={err.reset} />,
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

        let variables = {
          BASE_URL: "https://jsonplaceholder.typicode.com/todos/1",
        };

        const request = (await invoke("cmd_http_request", {
          toml_schema: toml,
          default_variables: JSON.stringify(variables),
        })) as Response;

        console.log("request", request);

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

  const { activeFile, hasSetProjectRoot } = useFileTree();
  const { createFile, updateFileContentById } = useFileTreeActions();
  const editorView = useRef<EditorView | null>(null);

  // Initializes a demo file
  useEffect(() => {
    const fileId = crypto.randomUUID();

    createFile({
      id: fileId,
      name: "syntax_demo.toml",
      type: "file",
      content: code.trim(),
      isSelectable: true,
      path: "",
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
      const response = data.text_response;
      const contentType = data.content_type;

      console.log("contentType", contentType);

      if (isJsonStr(response)) {
        return setResponse({
          code: JSON.parse(response as string),
          lang: "json",
        });
      }

      setResponse({
        code: response as string,
        lang: "text",
      });
    }
  }, [data]);

  // Get collections

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

          <div className="fixed right-0 flex items-center h-10 gap-x-4">
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
          {!hasSetProjectRoot ? (
            <IntroUi />
          ) : (
            <RequestUI
              data={data}
              theme={theme}
              mutate={mutate}
              setToml={setToml}
              response={response}
              tomlCode={tomlCode}
              isPending={isPending}
              editorView={editorView}
              disableSend={disableSend}
            />
          )}
        </section>
      </SidebarInset>
    </SidebarProvider>
  );
}

const IntroUi = () => {
  const { initFileTree, hasConfiguredProjectRoot } = useFileTreeActions();

  return (
    <div className="absolute flex flex-col items-center justify-center w-full h-full px-2 pb-3 overflow-hidden gap-y-4">
      <div className="text-center font-geist">
        <p className="mb-1 text-base text-neutral-700">
          Project root should contain{" "}
          <span className="font-semibold tracking-tighter">
            panda.config.json
          </span>
        </p>
        <p className="text-sm text-muted-foreground">
          This config contains your collections and will be read automatically
          if defined.
        </p>
      </div>

      <div className="flex gap-2 mt-4 font-geist">
        <Button
          className="border h-9"
          size="md"
          variant="default"
          // variant="outline"
          onClick={async () => {
            try {
              const project_root = await open({
                multiple: false,
                // directory: true,
                title: "Set working directory",
              });

              if (!project_root) {
                return;
              }

              const collections = (await invoke("cmd_get_collections", {
                config_path: project_root,
              })) as PandaCollection[];

              if (!collections || collections.length <= 0) {
                hasConfiguredProjectRoot(false);
                console.log("Collections was empty");
                return;
              }

              // TODO make sure this does not mutate the original file array
              initFileTree(collections);
            } catch (error) {
              console.log(error);
            }
          }}
        >
          Import project
        </Button>
      </div>
    </div>
  );
};

const RequestUI = ({
  data,
  theme,
  mutate,
  setToml,
  response,
  tomlCode,
  isPending,
  editorView,
  disableSend,
}: {
  data: any;
  disableSend: boolean;
  response: any;
  theme: string;
  isPending: boolean;
  editorView: any;
  mutate: () => void;
  tomlCode: string;
  setToml: (val: string) => void;
}) => {
  return (
    <div className="absolute grid grid-cols-1 gap-2 px-2 pb-3 mt-1 overflow-hidden size-full md:grid-cols-2">
      <div
        className="flex flex-col mt-2 gap-y-3 font-geist"
        onClick={() => editorView.current?.focus()}
      >
        <div className=" w-full h-[28px] flex">
          <Button
            size="icon"
            className="ml-auto h-7 disabled:bg-neutral-400"
            disabled={disableSend || isPending}
            onClick={() => mutate()}
          >
            <SendIcon />
          </Button>
        </div>

        {/* TODO when request panel is clicked use ref to focus the editor */}
        <div className="relative border border-black/30 rounded-sm w-full overflow-scroll h-[calc(100%-28px)] scrollbar-hide">
          <CodeEditor
            ref={editorView}
            defaultText={tomlCode}
            onChange={(val) => setToml(val)}
            className="w-full text-base"
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
              <span className="text-sm ">{data.elapsed_time}s</span>
            </div>
          </div>
        )}

        {/* After the request has resolved. */}
        {!isPending && data && (
          // TODO refactor to use different response viewers
          <JsonViewer
            code={response.code}
            lang={response.lang}
            style={{
              marginTop: data ? "30px" : "0px",
            }}
          />
        )}

        {/* When there is no active request */}
        {!isPending && !data && <EmptyState />}

        {/* When there is an active request */}
        {isPending && (
          <>
            <div className="absolute font-poppins text-base top-0 flex items-center w-[calc(100%-15px)] mt-1 rounded-sm ">
              <div className="ml-auto border">
                <Button
                  variant="ghost"
                  size="icon"
                  className=" size-7"
                  onClick={() => emit("cancel_request", "null")}
                >
                  <X className="h-4" />
                  <span className="sr-only">Cancel request</span>
                </Button>
              </div>
            </div>
            <div className="flex flex-col items-center gap-y-2 mt-[60px]">
              <Loader className="animate-spin " />
              <span className="text-neutral-500">Please wait...</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-y-2 mt-[60px]">
      <div className="p-4 rounded-full bg-muted">
        <FolderOpen className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium">No file selected</h3>
      <p className="text-sm text-muted-foreground text-center max-w-[300px]">
        Please select a file from the sidebar to view its contents.
      </p>
    </div>
  );
}

function ErrorState({
  error,
  reset,
}: {
  error: ErrorComponentProps;
  reset: () => void;
}) {
  useEffect(() => {
    if (error) {
      console.error(error);
    }
  }, [error]);

  return (
    <div className="flex items-center justify-center w-full h-full pt-28">
      <div className="flex flex-col items-center max-w-md text-center">
        <div className="flex items-center justify-center w-20 h-20 text-red-600 bg-red-100 rounded-full">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h2 className="mt-6 text-2xl font-semibold">Something went wrong!</h2>
        <p className="mt-2 text-muted-foreground font-geist">
          {`Application error: ${error.error.message}` ||
            "An unexpected error occurred."}
        </p>
        <Button onClick={() => reset()} className="mt-6" variant="default">
          Try again
        </Button>
      </div>
    </div>
  );
}
