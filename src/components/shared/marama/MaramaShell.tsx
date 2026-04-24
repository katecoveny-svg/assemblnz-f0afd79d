import { ReactNode } from "react";
import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { LucideIcon } from "lucide-react";
import { MaramaKeteProvider, useMaramaTokens } from "./MaramaKeteContext";
import { KeteSlug } from "./tokens";

export interface MaramaNavItem {
  to: string;
  label: string;
  icon?: LucideIcon;
  badge?: ReactNode;
  /** When true (default), only matches the exact route */
  end?: boolean;
}

export interface MaramaNavGroup {
  label?: string;
  items: MaramaNavItem[];
}

interface MaramaShellProps {
  /** Kete accent for the entire dashboard subtree */
  kete?: KeteSlug;
  eyebrow?: string;
  title: string;
  titleMi?: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  /** Optional sidebar navigation. If omitted, renders without sidebar. */
  nav?: MaramaNavGroup[];
  /** Sidebar header (logo / brand) */
  navHeader?: ReactNode;
  /** Sidebar footer (account / sign out) */
  navFooter?: ReactNode;
  children: ReactNode;
}

/**
 * Standard page shell for every Mārama dashboard.
 *
 * - Mist background, Cormorant headline, 24px content rhythm
 * - Optional collapsible sidebar with kete-coloured active rail
 * - Sets MaramaKeteProvider so every child primitive inherits the accent
 */
export function MaramaShell({
  kete = "admin",
  eyebrow,
  title,
  titleMi,
  description,
  icon,
  actions,
  nav,
  navHeader,
  navFooter,
  children,
}: MaramaShellProps) {
  if (!nav || nav.length === 0) {
    // No sidebar — original layout
    return (
      <MaramaKeteProvider kete={kete}>
        <ShellBody
          eyebrow={eyebrow}
          title={title}
          titleMi={titleMi}
          description={description}
          icon={icon}
          actions={actions}
        >
          {children}
        </ShellBody>
      </MaramaKeteProvider>
    );
  }

  return (
    <MaramaKeteProvider kete={kete}>
      <SidebarProvider>
        <ShellWithSidebar
          nav={nav}
          navHeader={navHeader}
          navFooter={navFooter}
          eyebrow={eyebrow}
          title={title}
          titleMi={titleMi}
          description={description}
          icon={icon}
          actions={actions}
        >
          {children}
        </ShellWithSidebar>
      </SidebarProvider>
    </MaramaKeteProvider>
  );
}

interface BodyProps {
  eyebrow?: string;
  title: string;
  titleMi?: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}

function ShellBody({
  eyebrow,
  title,
  titleMi,
  description,
  icon,
  actions,
  children,
}: BodyProps) {
  const T = useMaramaTokens();
  return (
    <div
      className="min-h-screen w-full"
      style={{ background: T.surface, color: T.textPrimary }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
        <ShellHeader
          eyebrow={eyebrow}
          title={title}
          titleMi={titleMi}
          description={description}
          icon={icon}
          actions={actions}
        />
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
}

interface SidebarShellProps extends BodyProps {
  nav: MaramaNavGroup[];
  navHeader?: ReactNode;
  navFooter?: ReactNode;
}

function ShellWithSidebar({
  nav,
  navHeader,
  navFooter,
  children,
  ...header
}: SidebarShellProps) {
  const T = useMaramaTokens();
  return (
    <div
      className="min-h-screen flex w-full"
      style={{ background: T.surface, color: T.textPrimary }}
    >
      <MaramaSidebar nav={nav} header={navHeader} footer={navFooter} />
      <div className="flex-1 flex flex-col min-w-0">
        <header
          className="h-12 flex items-center gap-2 border-b px-3 sm:px-4"
          style={{
            borderColor: T.borderSoft,
            background: "rgba(255,255,255,0.6)",
            backdropFilter: "blur(12px)",
          }}
        >
          <SidebarTrigger />
          <span
            className="text-xs font-mono uppercase tracking-[0.2em]"
            style={{ color: T.textSecondary }}
          >
            {header.eyebrow ?? `Mārama · ${T.kete}`}
          </span>
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
            <ShellHeader {...header}>{null}</ShellHeader>
            <div className="space-y-6">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}

function ShellHeader({
  eyebrow,
  title,
  titleMi,
  description,
  icon,
  actions,
}: Omit<BodyProps, "children"> & { children?: ReactNode }) {
  const T = useMaramaTokens();
  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-wrap items-end justify-between gap-6"
    >
      <div className="flex items-start gap-4">
        {icon && (
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
            style={{
              background: T.accentSoft,
              border: `1px solid ${T.borderSoft}`,
              color: T.accentDeep,
            }}
          >
            {icon}
          </div>
        )}
        <div>
          {eyebrow && (
            <p
              className="font-mono text-[11px] uppercase tracking-[0.2em] mb-2"
              style={{ color: T.textSecondary }}
            >
              {eyebrow}
            </p>
          )}
          <h1
            className="font-display font-light leading-tight text-3xl sm:text-4xl"
            style={{ color: T.textPrimary }}
          >
            {title}
            {titleMi && (
              <span
                className="ml-3 font-mono text-base align-middle"
                style={{ color: T.textMuted }}
              >
                {titleMi}
              </span>
            )}
          </h1>
          {description && (
            <p
              className="mt-2 max-w-2xl text-sm leading-relaxed"
              style={{ color: T.textSecondary }}
            >
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </motion.header>
  );
}

function MaramaSidebar({
  nav,
  header,
  footer,
}: {
  nav: MaramaNavGroup[];
  header?: ReactNode;
  footer?: ReactNode;
}) {
  const T = useMaramaTokens();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar
      collapsible="icon"
      style={
        {
          "--sidebar-background": "0 0% 100%",
          "--sidebar-foreground": "22 12% 35%",
          "--sidebar-border": "30 15% 88%",
          "--sidebar-accent": "30 23% 95%",
          "--sidebar-accent-foreground": "22 12% 35%",
        } as React.CSSProperties
      }
    >
      <SidebarContent
        style={{
          background: "rgba(255,255,255,0.92)",
          borderRight: `1px solid ${T.borderSoft}`,
          backdropFilter: "blur(18px)",
        }}
      >
        {header && (
          <div
            className="px-3 py-4 border-b"
            style={{ borderColor: T.borderSoft }}
          >
            {header}
          </div>
        )}
        {nav.map((group, gi) => (
          <SidebarGroup key={gi}>
            {group.label && !collapsed && (
              <SidebarGroupLabel
                className="font-mono text-[10px] uppercase tracking-[0.2em]"
                style={{ color: T.textMuted }}
              >
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.to}
                        end={item.end ?? true}
                        className="group/navlink flex items-center gap-2 rounded-xl"
                      >
                        {({ isActive }) => (
                          <span
                            className="flex w-full items-center gap-2 rounded-xl px-2 py-1.5 transition-colors"
                            style={{
                              background: isActive
                                ? T.accentSoft
                                : "transparent",
                              color: isActive ? T.accentDeep : T.textPrimary,
                              borderLeft: `2px solid ${
                                isActive ? T.accent : "transparent"
                              }`,
                            }}
                          >
                            {item.icon && (
                              <item.icon
                                className="h-4 w-4 shrink-0"
                                style={{
                                  color: isActive ? T.accentDeep : T.textSecondary,
                                }}
                              />
                            )}
                            {!collapsed && (
                              <>
                                <span className="text-sm flex-1 truncate">
                                  {item.label}
                                </span>
                                {item.badge}
                              </>
                            )}
                          </span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
        {footer && (
          <div
            className="mt-auto px-3 py-4 border-t"
            style={{ borderColor: T.borderSoft }}
          >
            {footer}
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
