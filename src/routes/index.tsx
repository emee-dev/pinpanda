import { AppSidebar } from "@/components/app-sidebar";
import CodeEditor from "@/components/CodeEditor";
import { NavActions } from "@/components/nav_actions";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { createFileRoute } from "@tanstack/react-router";
import { invoke } from "@tauri-apps/api/core";
import { Dot, Hourglass, Lightbulb, Loader, SendIcon } from "lucide-react";
import { CSSProperties, useEffect, useState } from "react";
import RJV from "react-json-view";
import { parse, stringify } from "smol-toml";
import { useTheme } from "@/components/theme-provider";
import { formatTOMl } from "@/lib/toml";
import { X } from "lucide-react";
import "./rjv.css";
import Tabs from "@/components/Tabs";
import { useMutation } from "@tanstack/react-query";
import { useFileTreeStore } from "@/hooks/use-filetree";

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

[post.form_multipart]
content = [
    { field = "username", value = "wormclient" },
    { field = "description", value = "This is the best api client." },
    # { field = "avatar", value = "./some_file (coming soon)." },
]

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
        console.log("Error:", error);
        return Promise.reject(error);
      }
    },
  });
  const { currentFile, contents } = useFileTreeStore();

  useEffect(() => {
    setToml(code.trim());
  }, []);

  useEffect(() => {
    if (currentFile) {
      const currentContent = contents.get(currentFile.id);
      console.log("currentFile", currentContent);
      setToml(currentContent as string);
    }
  }, [currentFile]);

  useEffect(() => {
    if (tomlCode.trim() && currentFile) {
      const currentFileId = currentFile.id;
      contents.set(currentFileId, tomlCode);
    }
  }, [tomlCode, currentFile]);

  useEffect(() => {
    if (data) {
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
    <SidebarProvider defaultOpen={false} className="relative">
      <AppSidebar />

      <SidebarInset className={`h-screen overflow-hidden `}>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 ">
          <div className="flex items-center gap-2 px-4 transition-all">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-4 mr-2" />

            <Tabs />
          </div>
          <div className="px-3 ml-auto ">
            <NavActions onClick={async () => {}} />
          </div>
        </header>
        <div className="grid grid-cols-1 gap-4 px-2 overflow-hidden md:grid-cols-[1fr_1fr]">
          <div className="h-[650px] mt-1  gap-y-2 relative overflow-scroll font-geist scrollbar-hide rounded-md max-h-[650px] ">
            <div className="flex w-full p-1">
              <Button
                size="icon"
                className="w-12 ml-auto h-7"
                onClick={() => mutate()}
              >
                <SendIcon />
              </Button>
            </div>
            <CodeEditor
              defaultText={tomlCode}
              onChange={(val) => setToml(val)}
            />
          </div>

          <div
            className={`h-[650px] relative ${theme === "dark" ? "[--rjv_object_key:white]" : "[--rjv_object_key:black] bg-neutral-300/75 "} mt-1 p-2 border border-dashed  shadow-sm rounded-lg relative overflow-scroll max-h-[650px] scrollbar-hide ${isPending ? "flex justify-center" : "block"}`}
          >
            {data && (
              <div className="absolute top-0 flex items-center w-full mt-2 rounded-sm gap-x-2 bg-neutral-800/70">
                <div className="flex items-center">
                  <span className="text-sm text-neutral-500">
                    {data.status}
                  </span>
                </div>
                <div className="flex items-center">
                  <Dot className="h-7" />
                  <span className="text-sm text-neutral-500">
                    {data.elapsed_time}ms
                  </span>
                </div>
              </div>
            )}

            {!isPending && (
              <ResponseTabContent
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
      </SidebarInset>
    </SidebarProvider>
  );
}

const ResponseTabContent = (props: {
  code: Record<string, unknown> | string;
  lang: string;
  style?: CSSProperties;
}) => {
  if (props.lang !== "json") {
    return (
      <div style={props.style}>
        <span className="text-sm font-geist">{props.code as string}</span>
      </div>
    );
  }

  return (
    <RJV
      src={props.code as Record<string, unknown>}
      name={false}
      enableClipboard={false}
      displayDataTypes={false}
      iconStyle="triangle"
      collapsed={false}
      sortKeys={true}
      quotesOnKeys={false}
      theme="twilight"
      displayObjectSize={false}
      indentWidth={5}
      style={{
        ...props.style,
        // paddingLeft: "3px",
        fontSize: "13px",
        fontFamily: "Geist, sans-serif",
        background: "transparent",
      }}
    />
  );
};
