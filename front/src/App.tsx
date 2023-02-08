import React, { lazy } from 'react'
import { Router, Route, Switch } from 'react-router-dom'
import history from '@src/routerHistory'
import { PageLoader, SuspenseWithChunkError } from '@src/components';

const Items = lazy(() => import('./views/Items'))
const Order = lazy(() => import('./views/Order'))

function App() {
  return (
    <Router history={history}>
      <SuspenseWithChunkError fallback={<PageLoader />}>
        <Switch>
          <Route path="/" exact>
            <Items />
          </Route>
          <Route path="/items" exact>
            <Items />
          </Route>
          <Route path="/order/:id">
            <Order />
          </Route>
        </Switch>
      </SuspenseWithChunkError>
    </Router>
    
  );
}

export default App;
