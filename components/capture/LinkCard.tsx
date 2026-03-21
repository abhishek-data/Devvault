"use client";

import { ExternalLink, Youtube, Github, Twitter, FileText, Globe, X } from "lucide-react";
import type { LinkBlock } from "@/lib/types";

const contentTypeConfig = {
  youtube: { icon: Youtube, color: "text-[#FF0000]", label: "YouTube" },
  github: { icon: Github, color: "text-[var(--text-primary)]", label: "GitHub" },
  tweet: { icon: Twitter, color: "text-[#1DA1F2]", label: "X / Twitter" },
  article: { icon: FileText, color: "text-[var(--accent-bright)]", label: "Article" },
  generic: { icon: Globe, color: "text-[var(--text-secondary)]", label: "Link" },
};

interface LinkCardProps {
  block: LinkBlock;
  onRemove?: () => void;
  compact?: boolean;
}

export function LinkCard({ block, onRemove, compact }: LinkCardProps) {
  const config = contentTypeConfig[block.contentType || "generic"];
  const TypeIcon = config.icon;

  return (
    <div
      id={`block-${block.blockId}`}
      className="group relative bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-lg)] overflow-hidden hover:border-[var(--border-strong)] transition-colors"
    >
      <a
        href={block.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex gap-3 p-3 no-underline"
      >
        {/* Thumbnail */}
        {block.image && !compact && (
          <div className="w-[120px] h-[80px] flex-shrink-0 rounded-[var(--radius-md)] overflow-hidden bg-[var(--bg-overlay)]">
            <img
              src={block.image}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <TypeIcon className={`h-3 w-3 flex-shrink-0 ${config.color}`} />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
              {config.label}
            </span>
          </div>

          <h4 className="text-[13px] font-semibold text-[var(--text-primary)] line-clamp-1 mb-0.5">
            {block.title || block.url}
          </h4>

          {block.description && (
            <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
              {block.description}
            </p>
          )}

          <div className="flex items-center gap-1.5 mt-1.5">
            {block.favicon && (
              <img
                src={block.favicon}
                alt=""
                className="w-3 h-3 rounded-sm"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            )}
            <span className="text-[10px] text-[var(--text-tertiary)] truncate">
              {block.domain || new URL(block.url).hostname}
            </span>
            <ExternalLink className="h-2.5 w-2.5 text-[var(--text-tertiary)] flex-shrink-0" />
          </div>
        </div>
      </a>

      {/* Remove button */}
      {onRemove && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove();
          }}
          className="absolute top-2 right-2 p-1 rounded bg-[var(--bg-overlay)] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--bg-surface)]"
        >
          <X className="h-3 w-3 text-[var(--text-tertiary)]" />
        </button>
      )}
    </div>
  );
}
