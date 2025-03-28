import {
  autocompletion,
  Completion,
  CompletionSource,
} from "@codemirror/autocomplete";
import { defaultKeymap, indentWithTab } from "@codemirror/commands";
import { EditorState } from "@codemirror/state";
import { json } from "@codemirror/lang-json";
import {
  Command,
  EditorView,
  highlightActiveLine,
  keymap,
} from "@codemirror/view";
import { tags as t } from "@lezer/highlight";
import { createTheme, CreateThemeOptions } from "@uiw/codemirror-themes";
import { basicSetup } from "codemirror";
import { RefObject, useEffect, useRef } from "react";
import "./Editor.css";
import { toml } from "./lang-toml";
import { cn } from "@/lib/utils";

const myTheme = createTheme({
  theme: "dark",
  settings: {
    caret: "#5d00ff",
    selection: "#036dd626",
    selectionMatch: "#036dd626",
    lineHighlight: "#8a91991a",
    gutterBackground: "transparent",
    gutterForeground: "#8a919966",
    gutterBorder: "2px",
  } as CreateThemeOptions["settings"],
  styles: [
    { tag: t.comment, color: "#6A9955" },
    { tag: t.variableName, color: "#9CDCFE" },
    { tag: [t.string, t.special(t.brace)], color: "#CE9178" },
    { tag: t.number, color: "#B5CEA8" },
    { tag: t.bool, color: "#569CD6" },
    { tag: t.null, color: "#D4D4D4" },
    { tag: t.keyword, color: "#569CD6" },
    { tag: t.operator, color: "#D4D4D4" },
    { tag: t.className, color: "#4EC9B0" },
    { tag: t.definition(t.typeName), color: "#4EC9B0" },
    { tag: t.typeName, color: "#4EC9B0" },
    { tag: t.angleBracket, color: "#D4D4D4" },
    { tag: t.tagName, color: "#569CD6" },
    { tag: t.attributeName, color: "#CE9178" },
    { tag: t.attributeValue, color: "#CE9178" },
  ],
} as CreateThemeOptions);

const handleCtrlS: Command = (_target: EditorView) => {
  console.log("Ctrl S Shortcut Pressed!");

  return true;
};

const editor = EditorView.baseTheme({
  ".cm-editor > .cm-scroller": {
    display: "none",
  },
  ".cm-editor.cm-focused": {
    border: "none",
  },
});

const completions: Completion[] = [
  // { label: "panic", type: "keyword" },
  // { label: "park", type: "constant", info: "Test completion" },
  // { label: "password", type: "variable" },
  // snippetCompletion("some_random(${1:param}) { ${2:body} }", {
  //   label: "some_random",
  //   type: "function",
  // }),
  // snippetCompletion('content = """\n{${1}}\n"""', {
  //   label: "json body",
  //   type: "function",
  // }),
];

const myCompletions: CompletionSource = (context) => {
  let before = context.matchBefore(/\w+/);
  if (!context.explicit && !before) return null;
  return {
    from: before ? before.from : context.pos,
    options: completions,
    validFor: /^\w*$/,
  };
};

type CodeEditorProps = {
  defaultText: string;
  className?: string;
  lang?: "toml" | "json";
  onChange: (value: string) => void;
  ref?: RefObject<EditorView | null>;
};

export default function CodeEditor(props: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const startState = EditorState.create({
      doc: props.defaultText,
      extensions: [
        // toml(),
        props.lang === "json" ? json() : toml(),

        basicSetup,
        keymap.of([
          ...defaultKeymap,
          indentWithTab,
          {
            key: "Ctrl-s",
            run: handleCtrlS,
          },
        ]),
        autocompletion({ override: [myCompletions] }),
        EditorView.updateListener.of((v) => {
          const newText = v.state.doc.toString();
          if (newText !== props.defaultText) {
            props.onChange(newText);
          }
        }),
        EditorView.lineWrapping,
        myTheme,
        editor,
        highlightActiveLine(),
      ],
    });

    if (props.ref) {
      props.ref.current = new EditorView({
        state: startState,
        parent: editorRef.current as Element,
      });
    }

    return () => {
      if (props.ref) {
        props.ref.current?.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (
      props.ref &&
      props.ref.current &&
      props.defaultText !== props.ref.current.state.doc.toString()
    ) {
      props.ref.current.dispatch({
        changes: {
          from: 0,
          to: props.ref.current.state.doc.length,
          insert: props.defaultText,
        },
      });
    }
  }, [props.defaultText]);

  return <div ref={editorRef} className={cn("absolute", props.className)} />;
}
