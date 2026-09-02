
import React from 'react'
import { Outlet } from 'react-router-dom'

function CommonLayout() {
  return (
    <div>
      <h2>Common Content</h2>
      <Outlet/>
    </div>
  )
}


export default CommonLayout
