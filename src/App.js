import "./App.css";
import React, { useEffect, useRef, useState } from "react";
import shortid from "shortid";

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { collection, addDoc, serverTimestamp, query, orderBy, limit } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC2zXWiMmLmSF2QCwQ02A0mB86lG9gj3BI",
  authDomain: "chatapp23-5498f.firebaseapp.com",
  projectId: "chatapp23-5498f",
  storageBucket: "chatapp23-5498f.appspot.com",
  messagingSenderId: "454744665125",
  appId: "1:454744665125:web:1e3adf9171c66212a063cc",
  measurementId: "G-K5EVQ0RL4H"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
      <img src={process.env.PUBLIC_URL + "/img/pngegg.png"} alt="Logo" />
        <SignOut />
      </header>
      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    try {
      signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Firebase Error:", error.message);
    }
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
          📤
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
