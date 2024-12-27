import { useNavigate } from 'react-router-dom';
import styles from './files/Main.module.css';


function Main() {
    const navigate = useNavigate();
    const getStarted = () => {
        console.log('I am clicked');
        navigate('/UserForm');
    };

    return (
        <div>
            <div className={styles.main_div}>
                <p className={styles.main_text}>
                    Hello! Welcome to the bi-directional chat.<br />
                    Click below to get started
                </p>
                <button className={styles.start_button} onClick={getStarted}>
                    Get Started
                </button>
              
            </div>
        </div>
    );
}

export default Main;
