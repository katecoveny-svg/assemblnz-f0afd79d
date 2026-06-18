'use client';

/**
 * HowItWorksModal — the "How it works →" explainer for consumer opt-in.
 * Built on Radix Dialog (already in the dep set) for focus-trapping, Esc to
 * close, and labelled overlay. Content is plain brand copy: it reiterates the
 * privacy posture so the user understands the trade before opting in.
 */
import { type ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import styles from './DashLoader.module.css';

export function HowItWorksModal({ trigger }: { trigger: ReactNode }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.dialogOverlay} />
        <Dialog.Content className={styles.dialogContent} data-dash="">
          <Dialog.Title className={styles.dialogTitle}>How Dash works</Dialog.Title>
          <Dialog.Description className={styles.dialogDesc}>
            When your app is thinking, Dash fills the wait instead of a blank spinner.
          </Dialog.Description>
          <ol className={styles.dialogList}>
            <li>
              <strong>You opt in.</strong> Nothing changes until you flip the switch — it&rsquo;s
              off by default.
            </li>
            <li>
              <strong>A small NZ-brand line shows while you wait.</strong> That&rsquo;s what earns
              the revenue. It&rsquo;s always labelled &ldquo;Sponsored&rdquo;.
            </li>
            <li>
              <strong>You choose where it goes.</strong> Keep it, or donate it to SPCA NZ, Trees
              That Count or Foodbank NZ.
            </li>
            <li>
              <strong>Your data stays yours.</strong> Dash never reads your content, prompts, files
              or code. Your IP is used only to confirm you&rsquo;re in Aotearoa.
            </li>
          </ol>
          <Dialog.Close asChild>
            <button type="button" className={styles.primaryBtn}>
              Got it
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
