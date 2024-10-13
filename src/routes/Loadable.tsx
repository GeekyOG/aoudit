import React, { Suspense } from 'react';

import Loader from './Loader';

const Loadable =
  (Component: React.LazyExoticComponent<() => React.JSX.Element>) =>
  (props: object) =>
    (
      <Suspense fallback={<Loader />}>
        <Component {...props} />
      </Suspense>
    );

export default Loadable;
