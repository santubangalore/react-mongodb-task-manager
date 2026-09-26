import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../header';

function CommonLayout() {
  return (
    <div className="flex flex-auto flex-col min-h-screen bg-slate-50">
      <div className="flex flex-auto">
        <main className="flex flex-col min-w-0 w-full bg-gradient-to-br from-blue-50/60 via-sky-50/30 to-indigo-50/40 min-h-screen">
          <Header />
          <div className="flex flex-auto flex-col justify-between min-h-[calc(100vh-64px)]">
            <div className="h-full">
              <div className="h-full flex flex-auto flex-col px-4 sm:px-6 md:px-8 py-6">
                <div className="mx-auto container h-full">
                  <Outlet />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default CommonLayout;
