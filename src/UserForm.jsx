import styles from './files/UserForm.module.css';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

function UserForm(){
    const[userName,setuserName]= useState("");
    const navigate = useNavigate();
    const routetochatbox =(event)=>{
        event.preventDefault();
        navigate('/chatbox',{state:{userName:userName}});
    }
    return(
        <>
        <div>
        <form className={styles.form}>
            <label className={styles.label}>Username:</label>
            <input type="text" value={userName} onChange={(e)=>setuserName(e.target.value)}></input>

            <button onClick={routetochatbox} className={styles.submit}>Submit</button>
        </form>
        </div>
       
        </>
    );
}
export default UserForm;