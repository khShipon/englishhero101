import type { LessonContent, LessonMark, LessonNode } from "@/types/lesson-content";
import { createHeadingIdAssigner } from "@/lib/lessons/heading-ids";
import { extractText } from "@/lib/lessons/extract-headings";
import { PronounceButton } from "@/components/lessons/pronounce-button";

// Every branch maps a known, schema-validated node type straight to a
// React element. There is no dangerouslySetInnerHTML anywhere in this
// file — that's what makes rendering stored lesson content safe:
// nothing outside the whitelist in types/lesson-content.ts can ever
// reach the DOM as markup, only as inert text.
function renderMarks(text: string, marks: LessonMark[] | undefined, key: React.Key) {
  let node: React.ReactNode = text;
  for (const mark of marks ?? []) {
    if (mark.type === "bold") node = <strong>{node}</strong>;
    else if (mark.type === "italic") node = <em>{node}</em>;
    else if (mark.type === "underline") node = <u>{node}</u>;
    else if (mark.type === "strike") node = <s>{node}</s>;
    else if (mark.type === "highlight") node = <mark data-color={mark.attrs.color}>{node}</mark>;
    else if (mark.type === "link")
      node = (
        <a href={mark.attrs.href} target="_blank" rel="noopener noreferrer">
          {node}
        </a>
      );
  }
  return <span key={key}>{node}</span>;
}

type AssignId = (text: string) => string;

function renderChildren(nodes: LessonNode[] | undefined, assignId: AssignId) {
  return nodes?.map((child, index) => renderNode(child, index, assignId));
}

function renderNode(node: LessonNode, key: React.Key, assignId: AssignId): React.ReactNode {
  switch (node.type) {
    case "text":
      return renderMarks(node.text, node.marks, key);
    case "paragraph":
      return (
        <p key={key} style={node.attrs?.textAlign ? { textAlign: node.attrs.textAlign } : undefined}>
          {renderChildren(node.content, assignId)}
        </p>
      );
    case "heading": {
      // Same assigner instance the table of contents uses
      // (extract-headings.ts), walking in the same document order, so
      // these ids and the TOC's #links always match.
      const id = assignId(node.content?.map(extractText).join("") ?? "");
      const children = renderChildren(node.content, assignId);
      const style = node.attrs.textAlign ? { textAlign: node.attrs.textAlign } : undefined;
      if (node.attrs.level === 2)
        return (
          <h2 key={key} id={id} style={style}>
            {children}
          </h2>
        );
      if (node.attrs.level === 3)
        return (
          <h3 key={key} id={id} style={style}>
            {children}
          </h3>
        );
      return (
        <h4 key={key} id={id} style={style}>
          {children}
        </h4>
      );
    }
    case "bulletList":
      return <ul key={key}>{renderChildren(node.content, assignId)}</ul>;
    case "orderedList":
      return <ol key={key}>{renderChildren(node.content, assignId)}</ol>;
    case "listItem":
      return <li key={key}>{renderChildren(node.content, assignId)}</li>;
    case "blockquote":
      return <blockquote key={key}>{renderChildren(node.content, assignId)}</blockquote>;
    case "table":
      return (
        <div key={key} className="overflow-x-auto">
          <table>
            <tbody>{renderChildren(node.content, assignId)}</tbody>
          </table>
        </div>
      );
    case "tableRow":
      return <tr key={key}>{renderChildren(node.content, assignId)}</tr>;
    case "tableCell":
      return <td key={key}>{renderChildren(node.content, assignId)}</td>;
    case "tableHeader":
      return <th key={key}>{renderChildren(node.content, assignId)}</th>;
    case "hardBreak":
      return <br key={key} />;
    case "horizontalRule":
      return <hr key={key} />;
    case "callout":
      return (
        <div key={key} data-callout data-variant={node.attrs.variant}>
          {renderChildren(node.content, assignId)}
        </div>
      );
    case "pronounce":
      return <PronounceButton key={key} text={node.attrs.text} label={node.attrs.label} />;
    default:
      return null;
  }
}

export function LessonRenderer({ content }: { content: LessonContent }) {
  const assignId = createHeadingIdAssigner();
  return (
    <div className="prose prose-neutral max-w-none dark:prose-invert">
      {content.content.map((node, index) => renderNode(node, index, assignId))}
    </div>
  );
}
