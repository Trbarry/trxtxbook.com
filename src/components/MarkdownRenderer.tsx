import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { Check, Copy, X, Brain, AlertTriangle, FileText, Sparkles } from 'lucide-react';
import Mermaid from './Mermaid';

export const Callout = ({ type, title, children }: { type: string; title?: string; children: React.ReactNode }) => {
  const config: Record<string, { icon: any; color: string; bg: string; border: string; label: string }> = {
    info:    { icon: Brain,         color: 'text-blue-500',   bg: 'bg-blue-500/5',   border: 'border-blue-500/20',   label: 'Info' },
    tip:     { icon: Sparkles,      color: 'text-green-500',  bg: 'bg-green-500/5',  border: 'border-green-500/20',  label: 'Astuce' },
    warning: { icon: AlertTriangle, color: 'text-amber-500',  bg: 'bg-amber-500/5',  border: 'border-amber-500/20',  label: 'Attention' },
    danger:  { icon: X,             color: 'text-red-500',    bg: 'bg-red-500/5',    border: 'border-red-500/20',    label: 'Danger' },
    note:    { icon: FileText,      color: 'text-violet-500', bg: 'bg-violet-500/5', border: 'border-violet-500/20', label: 'Note' },
  };
  const style = config[type.toLowerCase()] || config.note;
  const Icon = style.icon;
  return (
    <div className={`my-4 sm:my-6 rounded-xl border-l-4 ${style.border} ${style.bg} overflow-hidden shadow-sm`}>
      <div className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 border-b border-white/5 font-bold uppercase tracking-wider text-[9px] sm:text-[10px] ${style.color}`}>
        <Icon size={14} /><span>{title || style.label}</span>
      </div>
      <div className="px-3 sm:px-4 py-2 sm:py-3 prose-p:my-0 text-sm leading-relaxed text-gray-700 dark:text-gray-300">{children}</div>
    </div>
  );
};

export const CodeBlock = ({ children, className, ...props }: any) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : null;
  const content = String(children).replace(/\n$/, '');
  const handleCopy = async () => { await navigator.clipboard.writeText(content); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  if (language === 'mermaid') return <Mermaid chart={content} />;
  if (!match) return <code className="bg-gray-100 dark:bg-[#1a1a20] text-violet-700 dark:text-violet-200 px-1.5 py-0.5 rounded font-mono text-[13px] sm:text-sm border border-gray-200 dark:border-white/10 shadow-sm" {...props}>{children}</code>;
  return (
    <div className="relative group my-6 sm:my-8 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 bg-[#0f0f13] shadow-xl">
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 bg-[#1a1a20] border-b border-white/5">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500/20"></div><div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20"></div><div className="w-2.5 h-2.5 rounded-full bg-green-500/20"></div></div>
          <span className="text-[10px] text-gray-500 font-mono ml-1 sm:ml-2 uppercase tracking-widest opacity-70">{language}</span>
        </div>
        <button onClick={handleCopy} className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-500 hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/5">{copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}</button>
      </div>
      <div className="p-3 sm:p-5 overflow-x-auto custom-scrollbar bg-black/20">
        <code className={`font-mono text-[13px] sm:text-sm text-gray-300 leading-relaxed ${className}`} {...props}>{children}</code>
      </div>
    </div>
  );
};

export const buildMarkdownComponents = (onImageClick?: (src: string) => void) => ({
  code: CodeBlock,
  table: ({ children }: any) => (
    <div className="my-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-white/10 shadow-sm custom-scrollbar">
      <table className="w-full min-w-max text-sm border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }: any) => (
    <thead className="bg-gray-50 dark:bg-white/5 text-left">{children}</thead>
  ),
  tbody: ({ children }: any) => (
    <tbody className="divide-y divide-gray-100 dark:divide-white/5">{children}</tbody>
  ),
  tr: ({ children }: any) => (
    <tr className="transition-colors hover:bg-gray-50/80 dark:hover:bg-white/[0.03]">{children}</tr>
  ),
  th: ({ children }: any) => (
    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-white/10 whitespace-nowrap">
      {children}
    </th>
  ),
  td: ({ children }: any) => (
    <td className="px-4 py-3 text-gray-700 dark:text-gray-300 align-top">{children}</td>
  ),
  h2: ({ children }: any) => { const id = String(children).toLowerCase().replace(/[^\w]+/g, '-').replace(/^-+|-+$/g, ''); return <h2 id={id}>{children}</h2>; },
  h3: ({ children }: any) => { const id = String(children).toLowerCase().replace(/[^\w]+/g, '-').replace(/^-+|-+$/g, ''); return <h3 id={id}>{children}</h3>; },
  img: ({ src, alt }: any) => (
    <div className="my-6 sm:my-8 rounded-xl sm:rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-lg group cursor-zoom-in" onClick={() => onImageClick?.(src)}>
      <img src={src} alt={alt} className="w-full hover:scale-[1.02] transition-transform duration-500" />
      {alt && <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-50 dark:bg-white/5 text-[9px] sm:text-[10px] text-gray-500 font-medium italic border-t border-gray-200 dark:border-white/10 text-center">{alt}</div>}
    </div>
  ),
  blockquote: ({ children }: any) => {
    const content = React.Children.toArray(children);
    const firstChild = content[0] as any;
    if (firstChild && firstChild.props && firstChild.props.children) {
      const firstLine = String(firstChild.props.children[0] || '');
      const match = firstLine.match(/^\[!(\w+)\]\s*(.*)/);
      if (match) {
        const type = match[1]; const title = match[2];
        if (title.toLowerCase().includes('sommaire')) return null;
        const remainingChildren = [{ ...firstChild, props: { ...firstChild.props, children: [firstChild.props.children.slice(1)] } }, ...content.slice(1)];
        return <Callout type={type} title={title}>{remainingChildren}</Callout>;
      }
    }
    return <blockquote className="border-l-4 border-violet-500 bg-violet-500/5 px-4 py-1 my-4 italic text-gray-400">{children}</blockquote>;
  }
});

interface MarkdownRendererProps {
  content: string;
  onImageClick?: (src: string) => void;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, onImageClick, className = '' }) => {
  const components = buildMarkdownComponents(onImageClick);
  return (
    <div className={`prose max-w-none prose-sm sm:prose-base prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white prose-h2:text-xl sm:prose-h2:text-2xl prose-h2:mt-10 sm:prose-h2:mt-12 prose-h2:pb-2 prose-h2:border-b prose-h2:border-gray-200 dark:prose-h2:border-white/10 prose-h3:text-lg sm:prose-h3:text-xl prose-h3:text-violet-700 dark:prose-h3:text-violet-200 prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-strong:text-gray-900 dark:prose-strong:text-white prose-a:text-violet-600 dark:prose-a:text-violet-400 prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-blockquote:border-violet-500 prose-blockquote:bg-violet-50 dark:prose-blockquote:bg-violet-500/5 prose-img:rounded-xl ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={components as any}>{content}</ReactMarkdown>
    </div>
  );
};
