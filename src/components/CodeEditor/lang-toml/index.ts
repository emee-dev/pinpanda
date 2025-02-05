import { StreamLanguage } from "@codemirror/language";
import { StreamParser, LanguageSupport } from "@codemirror/language";

const tomlParser: StreamParser<any> = {
  name: "toml",
  startState: () => ({
    inString: false,
    stringType: "",
    lhs: true,
    inArray: 0,
    inMultiString: false,
  }),
  token: (stream, state) => {
    if (!state.inString && (stream.match('"""') || stream.match("'''"))) {
      state.stringType = stream.current();
      state.inMultiString = true;
      state.inString = true;
      return "string";
    }

    if (!state.inString && (stream.peek() === '"' || stream.peek() === "'")) {
      state.stringType = stream.peek();
      stream.next();
      state.inString = true;
      return "string";
    }

    if (state.inString) {
      while (!stream.eol()) {
        if (state.inMultiString && stream.match(state.stringType)) {
          state.inString = false;
          state.inMultiString = false;
          return "string";
        }
        if (!state.inMultiString && stream.peek() === state.stringType) {
          stream.next();
          state.inString = false;
          return "string";
        }
        if (stream.peek() === "\\") {
          stream.next();
        }
        stream.next();
      }
      return "string";
    }

    if (stream.sol() && state.inArray === 0) {
      state.lhs = true;
    }

    if (state.inArray && stream.peek() === "]") {
      stream.next();
      state.inArray--;
      return "bracket";
    }

    if (state.lhs && stream.match(/\[[^\]]+\]/)) {
      return "atom";
    }

    if (stream.peek() === "#") {
      stream.skipToEnd();
      return "comment";
    }

    if (stream.eatSpace()) {
      return null;
    }

    if (state.lhs && stream.match(/^[a-zA-Z0-9_-]+/)) {
      return "attributeName";
    }

    if (state.lhs && stream.peek() === "=") {
      stream.next();
      state.lhs = false;
      return "operator";
    }

    if (
      !state.lhs &&
      stream.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z?/)
    ) {
      return "atom";
    }

    if (!state.lhs && stream.match(/true|false/)) {
      return "atom";
    }

    if (!state.lhs && stream.peek() === "[") {
      state.inArray++;
      stream.next();
      return "bracket";
    }

    if (!state.lhs && stream.match(/-?\d+(\.\d+)?/)) {
      return "number";
    }

    stream.next();
    return null;
  },
  languageData: {
    commentTokens: { line: "#" },
  },
};

const tomlLanguage = StreamLanguage.define(tomlParser);

function toml() {
  return new LanguageSupport(tomlLanguage);
}

export { toml };
