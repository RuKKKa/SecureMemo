import React, { useMemo } from 'react';
import { marked } from 'marked';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const htmlContent = useMemo(() => {
    if (!content) return '';
    try {
      // marked のオプション設定
      marked.setOptions({
        gfm: true,
        breaks: true,
      });
      return marked.parse(content) as string;
    } catch (e) {
      console.error('Markdown parse error:', e);
      return content;
    }
  }, [content]);

  return (
    <div
      className={`markdown-body prose prose-slate dark:prose-invert max-w-none 
        [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-brand-700 dark:[&_h1]:text-brand-400 [&_h1]:border-b [&_h1]:border-slate-200 dark:[&_h1]:border-slate-800 [&_h1]:pb-2 [&_h1]:mt-6 [&_h1]:mb-3
        [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-900 dark:[&_h2]:text-slate-100 [&_h2]:mt-5 [&_h2]:mb-2.5
        [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-slate-800 dark:[&_h3]:text-slate-200 [&_h3]:mt-4 [&_h3]:mb-2
        [&_p]:leading-relaxed [&_p]:mb-3 text-slate-800 dark:text-slate-200
        [&_strong]:font-bold [&_strong]:text-slate-900 dark:[&_strong]:text-white
        [&_em]:italic
        [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-3 [&_ul]:space-y-1
        [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-3 [&_ol]:space-y-1
        [&_li]:leading-relaxed
        [&_blockquote]:border-l-4 [&_blockquote]:border-brand-500 [&_blockquote]:bg-brand-50/40 dark:[&_blockquote]:bg-brand-950/20 [&_blockquote]:pl-4 [&_blockquote]:py-1.5 [&_blockquote]:my-3 [&_blockquote]:rounded-r-lg [&_blockquote]:text-slate-600 dark:[&_blockquote]:text-slate-400
        [&_code]:bg-slate-100 dark:[&_code]:bg-slate-800 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:text-xs [&_code]:font-mono [&_code]:text-brand-600 dark:[&_code]:text-brand-400
        [&_pre]:bg-slate-900 dark:[&_pre]:bg-slate-950 [&_pre]:text-slate-100 [&_pre]:p-3.5 [&_pre]:rounded-2xl [&_pre]:overflow-x-auto [&_pre]:my-3
        [&_pre_code]:bg-transparent [&_pre_code]:text-inherit [&_pre_code]:p-0
        [&_hr]:my-6 [&_hr]:border-slate-200 dark:[&_hr]:border-slate-800
        [&_input[type="checkbox"]]:mr-2 [&_input[type="checkbox"]]:accent-brand-600
        ${className}
      `}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};
