import React, { useReducer, useRef } from 'react';
import nameof from 'ts-nameof.macro';
import { BEM, GetIndicator } from './Helpers';
import { ISource } from "./Store/ISource";
import { Api, Store, Sync } from './Store';
import './Store.Component.scss';
import { useStore } from './Helpers/Store/Store42/useStore';

export const StoreComponent: React.FC<{ OnSourceClick: (source: ISource) => void }> = (props) => {
  const [ login ] = useStore(Store, s => s.Login);
  const [ shared ] = useStore(Store, s => s.SharedState);

  const loginInput = useRef<HTMLInputElement>(null);
  const passwordInput = useRef<HTMLInputElement>(null);

  async function signin() {
    if (loginInput.current && passwordInput.current) {
      await Api.Signin(loginInput.current?.value, passwordInput.current?.value);
    }
  }

  async function signup() {
    GetIndicator().Wrap$(async () => {
      if (loginInput.current && passwordInput.current) {
        await Api.Signup(loginInput.current?.value, passwordInput.current?.value);
      }
    });
  }

  function logout() {
    Api.Logout();
  }

  async function restore() {
    GetIndicator().Wrap$(async () => {
      await Sync.RestoreSharedState();
    });
  }

  async function save() {
    GetIndicator().Wrap$(async () => {
      await Sync.SaveSharedState();
    });
  }

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
        <button onClick={save}>Save state</button>
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
