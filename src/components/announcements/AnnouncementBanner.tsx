'use client';

import { useState } from 'react';

export default function AnnouncementBanner({ content }: { content: string }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 border border-indigo-100 dark:border-indigo-900 text-sm text-indigo-700 dark:text-indigo-300">
      <span className="shrink-0">📢</span>
      <span className="flex-1">{content}</span>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-200"
      >
        ✕
      </button>
    </div>
  );
}
