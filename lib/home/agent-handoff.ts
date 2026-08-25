/**
 * Handing an agent from one part of the homepage to another.
 *
 * The cube and the phone sit in different panels of a horizontally scrolling
 * track. Threading a selected agent through every component between them would
 * mean lifting state to the page root and re-rendering the whole track on every
 * hover; a browser event costs nothing and keeps both sides independent.
 */

export const HOME_AGENT_EVENT = 'assembl:home-agent';

export function askAgent(slug: string) {
  window.dispatchEvent(new CustomEvent(HOME_AGENT_EVENT, { detail: { slug } }));
}
