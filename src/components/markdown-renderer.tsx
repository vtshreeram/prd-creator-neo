import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

function getIDFromChildren(children: React.ReactNode): string {
  let text = '';
  React.Children.forEach(children, (child) => {
    if (typeof child === 'string') {
      text += child;
    } else if (React.isValidElement(child) && child.props.children) {
      text += getIDFromChildren(child.props.children);
    }
  });
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => {
          const id = getIDFromChildren(children);
          return (
            <h1
              id={id}
              className="mt-8 mb-6 scroll-mt-24 border-b border-gray-200 pb-3 text-3xl font-bold tracking-tight text-gray-900"
            >
              {children}
            </h1>
          );
        },
        h2: ({ children }) => {
          const id = getIDFromChildren(children);
          return (
            <h2
              id={id}
              className="mt-8 mb-4 scroll-mt-24 text-2xl font-semibold tracking-tight text-gray-900"
            >
              {children}
            </h2>
          );
        },
        h3: ({ children }) => {
          const id = getIDFromChildren(children);
          return (
            <h3
              id={id}
              className="mt-6 mb-3 scroll-mt-24 text-xl font-semibold tracking-tight text-gray-900"
            >
              {children}
            </h3>
          );
        },
        p: ({ children }) => (
          <p className="mb-4 leading-relaxed text-gray-700">{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="mb-6 list-disc space-y-2 pl-6 text-gray-700">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-6 list-decimal space-y-2 pl-6 text-gray-700">
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className="mb-2 text-gray-700">{children}</li>
        ),
        hr: () => <hr className="my-8 border-gray-200" />,
        blockquote: ({ children }) => (
          <blockquote className="my-4 border-l-4 border-gray-200 bg-gray-50 py-2 pr-4 pl-4 text-gray-700 italic">
            {children}
          </blockquote>
        ),
        code: ({ className, children, ...props }) => {
          const match = /language-(\w+)/.exec(className || '');
          const isInline = !match;
          return isInline ? (
            <code
              className="rounded-md bg-gray-100 px-1.5 py-0.5 font-mono text-sm text-gray-900"
              {...props}
            >
              {children}
            </code>
          ) : (
            <div className="mb-4 overflow-x-auto rounded-lg border border-gray-200">
              <code
                className="block bg-gray-50 p-4 font-mono text-sm text-gray-800"
                {...props}
              >
                {children}
              </code>
            </div>
          );
        },
        pre: ({ children }) => (
          <div className="mb-4 overflow-x-auto rounded-lg border border-gray-200 bg-gray-50">
            <pre className="p-4 font-mono text-sm text-gray-800">
              {children}
            </pre>
          </div>
        ),
        table: ({ children }) => (
          <div className="mb-4 overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 bg-white">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-gray-50">{children}</thead>
        ),
        tbody: ({ children }) => (
          <tbody className="divide-y divide-gray-200 bg-white">
            {children}
          </tbody>
        ),
        th: ({ children }) => (
          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-4 py-3 text-sm text-gray-700">{children}</td>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            className="font-medium text-blue-600 underline underline-offset-4 hover:text-blue-800"
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-gray-900">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="text-gray-800 italic">{children}</em>
        )
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
