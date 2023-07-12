import "./App.css";
import React, { useEffect, useRef, useState } from "react";
import shortid from "shortid";

import { initializeApp } from "firebase/app";
import { getAuth,signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { collection, addDoc, serverTimestamp, query, orderBy, limit } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { getFirestore } from "firebase/firestore";

initializeApp({
  apiKey: "AIzaSyBYye2LShEYNdO8Tt3kcd2wC4CR2rREp6U",
  authDomain: "chatapp-950ee.firebaseapp.com",
  projectId: "chatapp-950ee",
  storageBucket: "chatapp-950ee.appspot.com",
  messagingSenderId: "408860841933",
  appId: "1:408860841933:web:03fce8fb362cd8d3ba5684",
  measurementId: "G-PB1QLGDTKQ",
});

const auth = getAuth();
const firestore = getFirestore();

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
      <img src="/src/img/envelope6.jpg" alt="Logo" />
        <SignOut />
      </header>
      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth,provider);
  };
  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>
        Sign in with Google
      </button>
      <p>
        Do not violate the community guidelines or you will be banned for life!
      </p>
    </>
  );
}

function SignOut() {
  return (
    auth.currentUser && (
      <button className="sign-out" onClick={() => auth.signOut()}>
        Sign Out
      </button>
    )
  );
}

function ChatRoom() {
  const dummy = useRef();
  const messagesRef = collection(firestore, "messages");
  const q = query(messagesRef, orderBy("createdAt"), limit(5000));

  const [messages] = useCollectionData(q, { idField: "id" });

  const [formValue, setFormValue] = useState("");

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await addDoc(messagesRef, {
      text: formValue,
      createdAt: serverTimestamp(),
      uid,
      photoURL,
    });

    setFormValue("");
  };

  useEffect(() => {
    dummy.current.scrollIntoView({
      behavior: "smooth",
      inline: "nearest"
    });
  }, [messages]);
  
  

  return (
    <>
      <main>
        {messages &&
          messages.map((msg) => (
            <ChatMessage key={shortid.generate()} message={msg} />
          ))}

        <span ref={dummy}></span>
      </main>

      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder="write something nice"
        />

        <button type="submit" disabled={!formValue}>
          ✉️
        </button>
      </form>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

  return (
    <>
      <div className={`message ${messageClass}`}>
        <img
          src={
            photoURL ||
            "https://api.adorable.io/avatars/23/abott@adorable.png"
          }
          alt=""
        />
        <p>{text}</p>
      </div>
    </>
  );
}

export default App;
