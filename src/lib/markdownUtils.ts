import { TocItem } from "../components/TableOfContents";

export const extractHeadings = (markdown: string): TocItem[] => {
  if (!markdown) return [];
  const lines = markdown.split('\n');
  const headings: TocItem[] = [];
  lines.forEach((line) => {
    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (match) {
      headings.push({
        id: match[2].toLowerCase().replace(/[^\w]+/g, '-'),
        text: match[2],
        level: match[1].length
      });
    }
  });
  return headings;
};
