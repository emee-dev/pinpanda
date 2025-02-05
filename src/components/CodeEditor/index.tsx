import {
  autocompletion,
  closeBrackets,
  Completion,
  CompletionSource,
} from "@codemirror/autocomplete";
import { defaultKeymap, history, indentWithTab } from "@codemirror/commands";
import { EditorState } from "@codemirror/state";
import {
  Command,
  EditorView,
  highlightActiveLine,
  keymap,
  rectangularSelection,
} from "@codemirror/view";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { tags as t } from "@lezer/highlight";
import { createTheme, CreateThemeOptions } from "@uiw/codemirror-themes";
import { Extension } from "@uiw/react-codemirror";
import { basicSetup } from "codemirror";
import { useEffect, useRef } from "react";
import "./CodeEditor.css";
import { toml } from "./lang-toml";
import { indentOnInput } from "@codemirror/language";

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
    { tag: t.operator, color: "#D4D4D4" }, // Default text color
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
  // console.log("_target", _target);

  // let textBefore = _target.contentDOM.innerText.trim();

  // _target.contentDOM.innerText = textBefore += "\nHello";
  console.log("Ctrl S Shortcut Pressed!");

  return true;
};

const extensions = [
  toml(),
  history(),
  EditorState.allowMultipleSelections.of(true),
  indentOnInput(),
  closeBrackets(),
  rectangularSelection(),
  // foldGutter({
  //   markerDOM(open) {
  //     const icon = document.createElement("i");
  //     icon.style.cursor = "pointer";

  //     icon.classList.add("fa-solid", open ? "fa-caret-down" : "fa-caret-right");

  //     return icon;
  //   },
  // }),
  keymap.of([
    {
      key: "Ctrl-s",
      run: handleCtrlS,
    },
  ]),
  highlightActiveLine(),
] as Extension[];

export default function CodeEditor(props: {
  defaultText: string;
  onChange: (value: string) => void;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorView = useRef<EditorView | null>(null);

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

  useEffect(() => {
    const startState = EditorState.create({
      doc: props.defaultText,
      extensions: [
        toml(),
        basicSetup,
        keymap.of([...defaultKeymap, indentWithTab]),
        autocompletion({ override: [myCompletions] }),
        EditorView.updateListener.of((v) => {
          const newText = v.state.doc.toString();
          if (newText !== props.defaultText) {
            props.onChange(newText);
          }
        }),
        myTheme,
      ],
    });

    editorView.current = new EditorView({
      state: startState,
      parent: editorRef.current as Element,
    });

    return () => {
      editorView.current?.destroy();
    };
  }, []);

  useEffect(() => {
    if (
      editorView.current &&
      props.defaultText !== editorView.current.state.doc.toString()
    ) {
      editorView.current.dispatch({
        changes: {
          from: 0,
          to: editorView.current.state.doc.length,
          insert: props.defaultText,
        },
      });
    }
  }, [props.defaultText]);

  return <div ref={editorRef} />;
}
