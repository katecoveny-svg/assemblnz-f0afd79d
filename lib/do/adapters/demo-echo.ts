import {
  CONTRACT_VERSION,
  DEMO_ECHO_ACTION,
  type ActionContract,
} from '@/lib/do/action-contract';

/** demo.echo — Phase 1 mock adapter. Completes prepare→permit→execute→verify→receipt. */
export const demoEchoContract: ActionContract = {
  contract_version: CONTRACT_VERSION,
  action: {
    name: DEMO_ECHO_ACTION.name,
    namespace: DEMO_ECHO_ACTION.namespace,
    version: DEMO_ECHO_ACTION.version,
    title: DEMO_ECHO_ACTION.title,
    description: DEMO_ECHO_ACTION.description,
    risk_class: DEMO_ECHO_ACTION.risk_class,
    idempotent: DEMO_ECHO_ACTION.idempotent,
    undoable: DEMO_ECHO_ACTION.undoable,
    transports: [...DEMO_ECHO_ACTION.transports],
  },
  input_schema: {
    type: 'object',
    required: ['message'],
    properties: {
      message: { type: 'string' },
      tag: { type: 'string' },
    },
  },
  output_schema: {
    type: 'object',
    properties: {
      echo: { type: 'string' },
      echoed_at: { type: 'string', format: 'date-time' },
    },
  },
  permissions: {
    scopes: ['demo:echo'],
    max_amount: null,
    requires_human: false,
  },
  adapters: {
    primary: 'demo.echo',
  },
  policy_refs: ['tenant.demo.v1'],
};

export function isDemoEcho(actionName: string, namespace: string): boolean {
  return (
    (actionName === 'echo' || actionName === 'demo.echo') &&
    (namespace === 'demo' || namespace === 'demo.echo')
  );
}

export function qualifyActionName(namespace: string, name: string): string {
  if (name.includes('.')) return name;
  return `${namespace}.${name}`;
}

export type DemoEchoResult = {
  echo: string;
  echoed_at: string;
  args: Record<string, unknown>;
};

export function runDemoEcho(args: Record<string, unknown>): DemoEchoResult {
  const message = typeof args.message === 'string' ? args.message : JSON.stringify(args);
  return {
    echo: message,
    echoed_at: new Date().toISOString(),
    args,
  };
}
