import React, { useReducer, useRef } from 'react';
import nameof from 'ts-nameof.macro';
import { BEM } from './Helpers';
import { ISource } from './State';
import { Store } from './Store';
import './Store.Component.scss';

export const StoreComponent: React.FC<{ OnSourceClick: (source: ISource) => void }> = (props) => {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  const loginInput = useRef<HTMLInputElement>(null);
  const passwordInput = useRef<HTMLInputElement>(null);

  async function signin() {
    if (loginInput.current && passwordInput.current) {
      try {
        await Store.Signin(loginInput.current?.value, passwordInput.current?.value);
      } finally {
        forceUpdate();
      }
    }
  }

  async function signup() {
    if (loginInput.current && passwordInput.current) {
      try {
        await Store.Signup(loginInput.current?.value, passwordInput.current?.value);
      } finally {
        forceUpdate();
      }
    }
  }

  function logout() {
    try {
      Store.Logout();
    } finally {
      forceUpdate();
    }
  }

  async function restore() {
    await Store.RestoreShareState();
    forceUpdate();
  }

  const { Login: login, SharedState: shared } = Store.Get();

  return (
    <div className={block()}> {
      !login ? <>
        Login: <input defaultValue='test' ref={loginInput}/><br/>
        Password: <input type='password' defaultValue='test' ref={passwordInput}/><br/>
        <button onClick={signin}>Signin</button> <button onClick={signup}>Signup</button>
      </> : <>
        <span>User: <b>{login}</b> </span>
        <button onClick={logout}>Logout</button>
        <button onClick={restore}>Restore state</button>
        <button onClick={() => Store.SaveSharedState()}>Save state</button>
        <br />
        <br />
        <div>
          { shared.Sources.map(source => (
              <div className={elem('Source')} key={source.Url} onClick={() => props.OnSourceClick(source)}>
                {source.Url} {(source.Position * 100).toFixed(1)}%
              </div>
            )) }
        </div>
      </>
    } </div>
  );
}

const { block, elem } = BEM(nameof(StoreComponent));
