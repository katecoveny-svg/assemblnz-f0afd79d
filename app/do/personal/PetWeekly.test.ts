import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { PetRoutineComposer, PetWeekly } from './PetWeekly';
import { LifeAdmin } from './LifeAdmin';
import { createPetRoutine } from '@/apps/do/personal/life-admin/engine';
const noOp = () => {};
describe('Pet weekly local UI contract', () => {
  it('labels the boundary and starts without invented pet or routine details', () => {
    const html=renderToStaticMarkup(createElement(PetRoutineComposer,{onCreate:noOp}));
    expect(html).toContain('Session-only local routine organiser');
    expect(html).toContain('Which days?'); expect(html).not.toContain('checked=""');
    expect(html).toContain('No times or responsibility are inferred');
    expect(html).not.toContain('Demo pet');
  });
  it('shows all seven days and only the owner-supplied activity', () => {
    const plan=createPetRoutine({nickname:'Demo pet',routine:'Put the blue toy away.',days:['Monday']});
    const html=renderToStaticMarkup(createElement(PetWeekly,{plan,onChange:noOp,onEditingChange:noOp}));
    expect(html.match(/<h5>/g)).toHaveLength(7);
    expect(html.match(/No routine supplied/g)).toHaveLength(6);
    expect(html).toContain('Put the blue toy away.');
    expect(html).toContain('Review does not mark any activity done');
    expect(html).not.toContain('Record completion');
    expect(html).not.toContain('Prepare my draft');
  });
  it('keys all routine state to the parent account context, including sign-out', () => {
    const a=LifeAdmin({storageScope:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'});
    const b=LifeAdmin({storageScope:'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'});
    const guest=LifeAdmin({storageScope:'guest'});
    expect(new Set([a.key,b.key,guest.key]).size).toBe(3);
  });
});
