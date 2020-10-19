import React, { useReducer, useRef } from 'react';
import { Store } from './Store';

export const StoreComponent: React.FC<{}> = () => {
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

  return (
    !Store.Login ? <>
      Login: <input defaultValue='test' ref={loginInput}/><br/>
      Password: <input type='password' defaultValue='test' ref={passwordInput}/><br/>
      <button onClick={signin}>Signin</button> <button onClick={signup}>Signup</button>
    </> : <>
      <span>User: <b>{Store.Login}</b> </span>
      <button onClick={logout}>Logout</button>
      <button onClick={() => Store.Restore()}>Restore state</button>
      <button onClick={() => Store.Save()}>Save state</button>
    </>
  );
}
