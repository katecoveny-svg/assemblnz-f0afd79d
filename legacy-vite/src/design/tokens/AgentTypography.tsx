/**
 * Ready-to-use React primitives for agent-card typography.
 *
 *   <AgentCode>ASM-008</AgentCode>
 *   <RoleText>Privacy Copilot</RoleText>
 *   <Tagline>Drafts your IPP 3A notice in plain English.</Tagline>
 *
 * They render the canonical scale from `typography.css`. If you need
 * inline styling instead, use `typeStyle("agentCode")` from `./typography`.
 */
import * as React from "react";
import { cn } from "@/lib/utils";

type SpanProps = React.HTMLAttributes<HTMLSpanElement>;
type PProps    = React.HTMLAttributes<HTMLParagraphElement>;

export const AgentCode = React.forwardRef<HTMLSpanElement, SpanProps>(
  ({ className, ...rest }, ref) => (
    <span
      ref={ref}
      className={cn("type-agent-code text-[var(--token-text-muted)]", className)}
      {...rest}
    />
  ),
);
AgentCode.displayName = "AgentCode";

export const RoleText = React.forwardRef<HTMLSpanElement, SpanProps>(
  ({ className, ...rest }, ref) => (
    <span
      ref={ref}
      className={cn("type-role-text text-[var(--token-text-secondary)]", className)}
      {...rest}
    />
  ),
);
RoleText.displayName = "RoleText";

export const Tagline = React.forwardRef<HTMLParagraphElement, PProps>(
  ({ className, ...rest }, ref) => (
    <p
      ref={ref}
      className={cn("type-tagline text-[var(--token-text-primary)]", className)}
      {...rest}
    />
  ),
);
Tagline.displayName = "Tagline";

export const AgentName = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...rest }, ref) => (
    <h3
      ref={ref}
      className={cn("type-agent-name text-[var(--token-text-strong)]", className)}
      {...rest}
    />
  ),
);
AgentName.displayName = "AgentName";

export const MetaLabel = React.forwardRef<HTMLSpanElement, SpanProps>(
  ({ className, ...rest }, ref) => (
    <span
      ref={ref}
      className={cn("type-meta-label text-[var(--token-text-muted)]", className)}
      {...rest}
    />
  ),
);
MetaLabel.displayName = "MetaLabel";
