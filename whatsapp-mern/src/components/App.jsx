import "./css/App.css";
import Sidebar from "./Sidebar";
import Chat from "./Chat";
import Pusher from "pusher-js";
import { useEffect, useState } from "react";
import axios from "C:\\Users\\neoyo\\Desktop\\react-projects\\whatsapp-clone\\whatsapp-mern\\src\\axios.js";

function App() {

  const [messages, setMessages] =  useState([]);

  useEffect(() => {
    axios.get('/messages/sync').then(response => {
      setMessages(response.data);
    });
  }, []);

  useEffect(() => {
    const pusher = new Pusher('a92c6d95392ac1fe7af9', {
      cluster: 'eu'
    });

    const channel = pusher.subscribe('messages');
    channel.bind('inserted', function(newMessage) {
      setMessages([...messages, newMessage]);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [messages]);

  console.log(messages);

  return (
    <div className="app">
      <div className="app__body">
        <Sidebar />
        <Chat messages = {messages} />
      </div>
    </div>
  );
}

export default App;
