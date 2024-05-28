import React from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';

import EditableTable from './pages/EditableTable.jsx';

const router = createBrowserRouter([
  {
    path: '/table2json',
    element: <EditableTable />,
  },
]);

function Router() {
  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
}

export default Router;
