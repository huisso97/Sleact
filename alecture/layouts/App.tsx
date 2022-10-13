import React from 'react';
import { Redirect, Route, Switch } from 'react-router';
import loadable from '@loadable/component';
const LogIn = loadable(() => import('@pages/LogIn'));
const SignUp = loadable(() => import('@pages/SignUp'));
const Channel = loadable(() => import('@pages/Channel'));

const App = () => {
  return (
    <Switch>
      {/* / 로 들어왔으면 login으로  리다이렉트 시킴 */}
      <Redirect exact path="/" to="/login" />
      <Route path="/login" component={LogIn} />
      <Route path="/signup" component={SignUp} />
      <Route path="/workspace" component={Channel} />
    </Switch>
  );
};

export default App;
