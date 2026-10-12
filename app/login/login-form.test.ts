import { expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
vi.mock('./actions', () => ({ passwordSignInAction: vi.fn(), sendMagicLinkAction: vi.fn(), socialSignInAction: vi.fn() }));
import { LoginForm } from './login-form';
it('announces a returned authentication error without hiding recovery choices', () => {
 const markup=renderToStaticMarkup(createElement(LoginForm,{redirectTo:'/do/widget',sent:false,errorMsg:'Fictional interrupted sign-in'}));
 expect(markup).toContain('role="alert"');
 expect(markup).toContain('Fictional interrupted sign-in');
 expect(markup).toContain('use password instead');
});
it('does not render unconfigured provider choices',()=>{
 const markup=renderToStaticMarkup(createElement(LoginForm,{redirectTo:'/do/widget',sent:false,errorMsg:null,providers:{google:false,apple:false}}));
 expect(markup).not.toContain('Continue with Google');expect(markup).not.toContain('Continue with Apple');
});
