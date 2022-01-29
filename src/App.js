import React, { useRef, useState, useEffect } from 'react';
import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
 
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

import { LoadingOutlined, SendOutlined } from '@ant-design/icons';

firebase.initializeApp({
  apiKey: "AIzaSyBEncGhCS5YElaxPuEVEvWqzqlcyDkNMoU",
  authDomain: "chat-app-81a59.firebaseapp.com",
  projectId: "chat-app-81a59",
  storageBucket: "chat-app-81a59.appspot.com",
  messagingSenderId: "530440142471",
  appId: "1:530440142471:web:1970ca666ee3e8ea3e0222",
  measurementId: "G-NW0NK48VCW"
})

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>Chat App using ⚛️🔥💬</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
  );
}

function SignIn() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
    </>
  )

}

function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  )
}


function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt', 'desc').limit(25);

  const [messages] = useCollectionData(query, { idField: 'id' });

  useEffect(() => {
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  

  const [formValue, setFormValue] = useState('');
  const [messLoading, setMessLoading] = useState(false);


  const sendMessage = async (e) => {
    setMessLoading(true)
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    setFormValue('');

    dummy.current.scrollIntoView({ behavior: 'smooth' });

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })
    
    setMessLoading(false)
  }

  return (<>
    <main>

      {messages && messages.reverse().map(msg => <ChatMessage key={msg.id} message={msg} />)}

      <span ref={dummy}></span>

    </main>

    <form onSubmit={sendMessage}>

      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something nice" />

      {
        
          <button type="submit" disabled={!formValue}>
            {
              messLoading
              ? <LoadingOutlined style={{ color: '#0b93f6' }}/>
              : <SendOutlined style={{ color: '#0b93f6' }}/>
            }
          </button>
      }

    </form>
  </>)
}


function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} />
      <div>{text}</div>
    </div>
  )
}


export default App;
