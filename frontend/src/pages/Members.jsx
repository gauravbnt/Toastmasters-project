import React from 'react';
import { Outlet } from 'react-router-dom';

const Members = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Outlet />
    </div>
  );
};

export default Members;
