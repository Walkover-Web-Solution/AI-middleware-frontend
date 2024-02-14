import React from 'react'

function Navbar() {
    return (
        <div className="navbar bg-primary flex items-center justify-between text-primary-content">
            <button className="btn btn-ghost text-xl">daisyUI</button>
            <div className="card-actions justify-end">
                <button className="btn">Api Docs</button>
                <button className="btn">Api Keys</button>
            </div>
        </div>
    )
}

export default Navbar
