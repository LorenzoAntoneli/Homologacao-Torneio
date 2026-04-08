import React from 'react';
import { useAdmin } from '../context/AdminContext';
import styles from './Login.module.css';
import logo from '../../assets/logo.jpg';

export default function Login() {
  const { password, setPassword, handleLogin } = useAdmin();

  return (
    <div className={styles.container}>
      {/* Remover borda do card de login para integrar a logo perfeitamente */}
      <div className={`app-card ${styles.card}`}>
        <img src={logo} alt="Careca's Logo" className={styles.logo} />
        <h2 className={styles.title}>ACESSO RESTRITO</h2>
        <form onSubmit={handleLogin}>
          <input 
            type="password" 
            placeholder="Senha" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
          />
          <button type="submit" className={`btn-primary ${styles.btn}`}>
            ENTRAR AGORA
          </button>
        </form>
      </div>
    </div>
  );
}
