import React from 'react'

function Navbar() {
    return (
        <div className="navbar bg-base-300 flex items-center justify-between">
            <button className="btn btn-ghost text-xl">daisyUI</button>
            <div className="card-actions justify-end">
                <button className="btn">Api Docs</button>
                <button className="btn">Api Keys</button>
            </div>
        </div>
    )
}

export default Navbar
