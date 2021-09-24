import React from 'react'

function LoginPage() {
    return (
        <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center'
            , width: '100%', height: '100vh'
        }}>
            <form style={{ display: 'flex', flexDirection: 'column'}}>
                <label>Email</label>
                <input type="email" value onChange />
                <lable>Password</lable>
                <input type="password" value onChange />

                <br/>

                <button>
                    Login
                </button>



            </form>
        </div>
    )
}

export default LoginPage
