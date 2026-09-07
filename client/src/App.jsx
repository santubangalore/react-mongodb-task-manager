import { useState } from 'react'
import './App.css'
import { Route, Routes } from 'react-router-dom'
import AuthPage from './pages/auth'
import CommonLayout from './components/common-layout'
import TasksPage from './pages/tasks'
import ScrumBoardPage from './pages/scrum-board';

//https://www.youtube.com/watch?v=dz458ZkBMak&t=32056s

function App() {

  return (
    <div className="bg-linear-to-r from-cyan-500 to-blue-500 min-h-screen h-full">
     <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/tasks" element={<CommonLayout />}>
          <Route path="list" element={<TasksPage />}/>
          <Route path="scrum-board" element={<ScrumBoardPage />} />
        </Route>
     </Routes>
    </div>
  )
}

export default App
