import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { readableBlogText } from '@/lib/blog-presentation';

export function ArticleMarkdown({ children }: { children: string }) {
  return (
    <div className="prose prose-lg max-w-none text-[var(--coastal-muted-text)]
      [&_h2]:text-[var(--coastal-text)] [&_h3]:text-[var(--coastal-text)]
      [&_h2]:font-display [&_h2]:text-3xl [&_h2]:mt-10 [&_h2]:mb-4
      [&_h3]:text-xl [&_h3]:mt-7 [&_h3]:mb-3 [&_h3]:font-semibold
      [&_p]:leading-relaxed [&_p]:mb-5 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-5
      [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-5 [&_li]:mb-2
      [&_strong]:text-[var(--coastal-text)] [&_a]:text-[var(--coastal-primary)] [&_a]:underline
      [&_a]:underline-offset-4 [&_img]:rounded-2xl [&_img]:my-6 [&_blockquote]:border-l-2
      [&_blockquote]:border-[var(--coastal-primary)] [&_blockquote]:pl-5 break-words">
      <ReactMarkdown remarkPlugins={[remarkGfm, readableBlogText]} components={{
        h1: ({ node: _node, ...props }) => <h2 {...props} />,
        table: ({ node: _node, ...props }) => (
          <div className="my-6 overflow-x-auto rounded-xl border border-[var(--coastal-border)]">
            <table className="w-full border-collapse text-sm" {...props} />
          </div>
        ),
        th: ({ node: _node, ...props }) => <th className="bg-[var(--surface-muted)] px-4 py-3 text-left text-[var(--coastal-text)]" {...props} />,
        td: ({ node: _node, ...props }) => <td className="border-t border-[var(--coastal-border)] px-4 py-3" {...props} />,
      }}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
