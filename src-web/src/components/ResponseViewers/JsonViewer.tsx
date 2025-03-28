import { CSSProperties } from "react";
import RJV from "react-json-view";
import "./JsonViewer.css";
// import CodeEditor from "../Editor";

const JsonViewer = (props: {
  code: Record<string, unknown> | string;
  lang: string;
  style?: CSSProperties;
}) => {
  if (props.lang === "text") {
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
      // indentWidth={3}
      style={{
        ...props.style,
        fontSize: "13px",
        fontFamily: "Geist, sans-serif",
        background: "transparent",
      }}
    />
    // <CodeEditor
    //   lang="json"
    //   defaultText={JSON.stringify(props.code) as string}
    //   onChange={(val) => {}}
    //   className="w-full text-base"
    // />
  );
};

export default JsonViewer;
