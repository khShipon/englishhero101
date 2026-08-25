import { mergeAttributes, Node } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    pronounce: {
      setPronounce: (text: string) => ReturnType;
    };
  }
}

// Inline, atomic "listen" chip — stores the text to be read aloud in
// attrs.text. Rendered client-side via PronounceButton (Web Speech
// API), never as literal HTML, so this stays as safe as every other
// node type in the whitelist.
export const Pronounce = Node.create({
  name: "pronounce",
  group: "inline",
  inline: true,
  atom: true,

  addAttributes() {
    return {
      text: {
        default: "",
        parseHTML: (element: HTMLElement) => element.getAttribute("data-text") || "",
        renderHTML: (attributes: { text: string }) => ({ "data-text": attributes.text }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "span[data-pronounce]" }];
  },

  renderHTML({ HTMLAttributes, node }) {
    return ["span", mergeAttributes(HTMLAttributes, { "data-pronounce": "" }), `🔊 ${node.attrs.text}`];
  },

  addCommands() {
    return {
      setPronounce:
        (text: string) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: { text } }),
    };
  },
});
