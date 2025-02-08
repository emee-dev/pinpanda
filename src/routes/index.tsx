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
import { Loader, SendIcon } from "lucide-react";
import { useEffect, useState } from "react";
import RJV from "react-json-view";
import { parse, stringify } from "smol-toml";
// import packageJson from "../../package.json";
import { useTheme } from "@/components/theme-provider";
import { formatTOMl } from "@/lib/toml";
import "./rjv.css";

export const Route = createFileRoute("/")({
  component: Index,
});

// const code = `
// # HTTP Request Definition
// [get]
// name = "Get User Info"
// url = "http://localhost:3000/json"

// [get.params]
// user_id = 12345

// [get.query]
// name = "emee"

// [get.body]
// type = "json"
// content = """
// {
//   "title": "New Post",
//   "content": "This is the content of the new post.",
//   "tags": ["example", "post"]
// }
// """

// [get.headers]
// Authorization = "{auth_token}"
// Accept = "application/json"
// `;

const code = `
[get]
name = "Get User Info"
url = "http://localhost:3000"
# query = [
#   "name=emee,ajike"
#   "limi=200"
# ]


[get.query]
name = "emee,ajike"
limit = 20
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

  useEffect(() => {
    setToml(code);
  }, []);

  useEffect(() => {
    if (window) {
      console.log(window);
    }
  }, [window]);

  return (
    <SidebarProvider defaultOpen={false} className="relative">
      <AppSidebar />

      <SidebarInset className={`h-screen overflow-hidden `}>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 ">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-4 mr-2" />
          </div>
          <div className="px-3 ml-auto ">
            <NavActions
              onClick={async () => {
                try {
                  const parsed = parse(tomlCode) as any;

                  let formatted_toml = formatTOMl(parsed as any);

                  let toml = stringify(formatted_toml);

                  let request = (await invoke("cmd_http_request", {
                    toml_schema: toml,
                  })) as Response;

                  let response = request.text_response;

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
                } catch (error: any) {
                  console.log("Error:", error);
                }
              }}
            />
          </div>
        </header>
        <div className="flex flex-col flex-1 gap-4 p-4 pt-2 overflow-hidden">
          <div className="grid grid-cols-1 gap-4 overflow-hidden md:grid-cols-2">
            <div className="h-[650px] mt-1 border border-dashed border-neutral-300 gap-y-2 relative overflow-scroll font-geist scrollbar-hide rounded-md max-h-[650px]">
              <div className="flex w-full p-1">
                <Button
                  size="icon"
                  className="w-12 ml-auto h-7"
                  onClick={async () => {
                    try {
                      const parsed = parse(tomlCode) as any;

                      let formatted_toml = formatTOMl(parsed as any);

                      let toml = stringify(formatted_toml);

                      let request = (await invoke("cmd_http_request", {
                        toml_schema: toml,
                      })) as Response;

                      let response = request.text_response;

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
                    } catch (error: any) {
                      console.log("Error:", error);
                    }
                  }}
                >
                  <SendIcon />
                </Button>
                {/* <Button size="icon" className="w-12 ml-auto h-7">
                  <Loader className="animate-spin" />
                </Button> */}
              </div>
              <CodeEditor
                defaultText={tomlCode}
                onChange={(val) => setToml(val)}
              />
            </div>

            <div
              className={`h-[650px] ${theme === "dark" ? "[--rjv_object_key:white] border-neutral-300" : "[--rjv_object_key:black] bg-neutral-300/75 border-neutral-800 "} mt-1 p-2 border border-dashed  shadow-sm rounded-lg relative overflow-scroll max-h-[650px] scrollbar-hide `}
            >
              {response.lang === "json" ? (
                <RJV
                  src={response.code}
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
                    // paddingLeft: "3px",
                    fontSize: "13px",
                    fontFamily: "Geist, sans-serif",
                    background: "transparent",
                  }}
                />
              ) : (
                <div>
                  <span className="text-base font-geist">
                    {response.code as string}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

// const TabNavigationWithIconsExample = () => (
//   <TabNavigation>
//     <TabNavigationLink href="#" active className="inline-flex gap-2">
//       <RiHome2Line className="size-4" aria-hidden="true" />
//       Home
//     </TabNavigationLink>
//     <TabNavigationLink href="#" className="inline-flex gap-2">
//       <RiBankCard2Line className="-ml-1 size-4" aria-hidden="true" />
//       Balances
//     </TabNavigationLink>
//     <TabNavigationLink href="#" className="inline-flex gap-2">
//       <RiExchange2Line className="-ml-1 size-4" aria-hidden="true" />
//       Transactions
//     </TabNavigationLink>
//     <TabNavigationLink href="#" className="inline-flex gap-2">
//       <RiCustomerService2Fill className="-ml-1 size-4" aria-hidden="true" />
//       Customers
//     </TabNavigationLink>
//   </TabNavigation>
// );
