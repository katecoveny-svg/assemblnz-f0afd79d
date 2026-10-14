export { ConnectionBroker } from './broker';
export { isWorkspaceUrl, isFixtureUrl } from './protocol';
// Staged live factories fail closed before any DOM read; no page relay exposes them.
export { createWoolworthsAdapter, prepareSupermarketAddition } from '../retailers/woolworths';
export { createWoolworthsDOMPort } from '../retailers/dom-port';

export { LocalMutationJournal } from '../journal/local';
