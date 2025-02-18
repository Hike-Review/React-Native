import { Text, View, StyleSheet } from "react-native";
import React, { useRef, useCallback, useMemo, useState, useEffect } from 'react';
import axios from 'axios';

export default function Profile() {

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registerMessage, setRegisterMessage] = useState('');

  const [loginName, setLoginName] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginMessage, setLoginMessage] = useState('');

  const registerSubmit = async (e) => {
    e.preventDefault();

    try {
      const registerResponse = await axios.post('http://127.0.0.1:5000/register', {username :username, email: email, password: password});
      console.log(registerResponse);
      setUsername('');
      setEmail('');
      setPassword('');
      setRegisterMessage(registerResponse.data.message || 'Registration successful!');
    } catch (error) {
      console.error(error);
      setRegisterMessage(error.response.data.message || 'Registration Failed.');
    }
  };

  const submitLogin = async (e) => {
    e.preventDefault();

    try {
      const loginResponse = await axios.post('http://127.0.0.1:5000/login', {username: loginName, email: loginName, password: loginPassword});
      console.log(loginResponse);
      setLoginName('');
      setLoginPassword('');
      setLoginMessage(loginResponse.data.message || 'Login successful!');
    } catch (error) {
      console.error(error);
      setLoginMessage(error.response.data.message || 'Login failed. Please try again.');
    }
  };

  return (
    <View
      style ={styles.container}
    >
      <div>
        Register: <br/>
        Username: <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}/><br/>
        Email: <input type="text" value={email} onChange={(e) => setEmail(e.target.value)}/><br/>
        Password: <input type="text" value={password} onChange={(e) => setPassword(e.target.value)}/><br/>
        <button onClick={registerSubmit}>Register</button>
        {registerMessage && <p>{registerMessage}</p>}
      </div><br/>

      <Text>
        ====
      </Text>

      <div>
        Login: <br/>
        Username/Email: <input type="text" value={loginName} onChange={(e) => setLoginName(e.target.value)}/><br/>
        Password: <input type="text" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}/><br/>
        <button onClick={submitLogin}>Login</button>
        {loginMessage && <p>{loginMessage}</p>}
      </div>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

