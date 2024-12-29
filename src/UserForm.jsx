import styles from './files/UserForm.module.css';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';



function UserForm(){
    const[userName,setuserName]= useState("");
    const navigate = useNavigate();
    const routetochatbox = (event) => {
        event.preventDefault();
    
        // Assuming you already have the 'joinedDate'
        const joineddate = new Date().toISOString(); // This could be dynamically set or fetched
    
        // Send 'username' and 'joinedDate' as query parameters in the GET request
        axios.get(`http://localhost:8080/api/authenticateuser?username=${userName}&joineddate=${joineddate}`, {
            validateStatus: (status) => {
                return status >= 200 && status < 500; // Reject only if status is not 2xx
            }
        })
        .then(response => {
            if (response.status === 200) {
                // Navigate to the /chatbox route with userName and joinedDate (if necessary)
                navigate('/chatbox', {
                    state: {
                        userName: userName,
                        joineddate: joineddate
                    }
                });
            }
            else if (response.status === 401) {
               
                    const ele = document.createElement('p');
                    ele.innerHTML = 'Username is taken by another participant';
                    ele.className = styles.errormsg;
                    document.querySelector('.errordiv').appendChild(ele);
                
                
                   
            } else {
                // Handle unsuccessful authentication
                alert('Authentication failed');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while calling the API');
        });
        
    };
    return(
        <>
        <div>
           <div className='errordiv'></div>
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