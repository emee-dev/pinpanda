import { CSSProperties } from "react";
import RJV from "react-json-view";
import "./JsonViewer.css";

const JsonViewer = (props: {
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
      indentWidth={3}
      style={{
        ...props.style,
        fontSize: "13px",
        fontFamily: "Geist, sans-serif",
        background: "transparent",
      }}
    />
  );
};

export default JsonViewer;
