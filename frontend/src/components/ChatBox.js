import React, { useState, useEffect } from 'react';

const ChatBox = ({ socket,user }) => {
  const curruser=user;
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [sessions, setSessions] = useState([]); 
 
  const [currentSessionId, setCurrentSessionId] = useState(null); 

  // console.log(user);
  useEffect(() => {
    
    socket.on('newSessionStarted', ({ sessionId }) => {
      setCurrentSessionId(sessionId); 
    });

    socket.emit('getSessionList',{user:curruser}); 
    socket.on('sessionList', (sessionList) => {
      setSessions(sessionList); 
    });

    socket.on('loadChatHistory', (messages) => {
      const chatMessages = Array.isArray(messages) ? messages : [];
      setMessages(
        chatMessages.map((msg) => ({
          type: 'received',
          text: msg.content,
          sender: msg.sender,
          timestamp: msg.timestamp,
        }))
      );
    });

    socket.on('receiveMessage', ({ message, sender }) => {
      setMessages(prevMessages => [
        ...prevMessages,
        { type: 'received', text: message, sender },
      ]);
    });

    return () => {
      socket.off('newSessionStarted');
      socket.off('loadChatHistory');
      socket.off('receiveMessage');
      socket.off('sessionList');
    };
  }, [socket,curruser]);

  const handleStartNewChat = () => {
    socket.emit('startNewChat', { user: curruser }); 
  };

  const handleSendMessage = () => {
    if (message.trim() && currentSessionId) {
      socket.emit('sendMessage', { content: message, sender: user, sessionId: currentSessionId });

      setMessages(prevMessages => [
        ...prevMessages,
        { type: 'sent', text: message },
      ]);

      setMessage(''); 
    }
  };

  
  const handleSessionClick = (sessionId) => {
    setCurrentSessionId(sessionId); 
    socket.emit('loadChatHistoryForSession', sessionId); 
  };
  // console.log(messages);

  return (
    <div  className='flex m-auto pl-0 p-5 h-[95vh] overflow-y-hidden'>
      <div className='w-1/4 md:w-1/6 mr-2'>
        <h4 className='text-2xl font-bold text-center'>Chat History</h4>
        <button
          onClick={handleStartNewChat}
          className='px-5 py-2 bg-[#28a745] rounded-lg my-5 ml-7 '>
          Start New Chat
        </button>
        <ul>
          {Array.isArray(sessions) && sessions.length > 0 ? (
            sessions.map((session) => (
              <li
                key={session.sessionId}
                onClick={() => handleSessionClick(session.sessionId)}
                style={{
                  cursor: 'pointer',
                  padding: '10px',
                  borderBottom: '1px solid #ccc',
                  backgroundColor: session.sessionId === currentSessionId ? '#f0f0f0' : 'transparent',
                }}
              >
                {/* <strong>Session {session.sessionId}</strong> */}
                <br />
                {session.lastMessage ? <strong>Last message: {session.lastMessage}</strong> : <strong>This chat is empty</strong>}
                <br />
                <small>Messages: {session.messagesCount}</small>
              </li>
            ))
          ) : (
            <li className='text-lg'>No sessions available</li>
          )}
        </ul>
      </div>

      <div style={{ width: '100%' }}>
        <div
          className="border-solid border-gray-700 rounded-lg border-2 p-2 mb-2 h-[80vh]"
         
        >
          {messages.length>0?messages.map((msg, index) => (
            <div
              key={index}
              style={{
                textAlign: msg.type === 'sent' ? 'right' : 'left',
                margin: '5px 0',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  backgroundColor: msg.type === 'sent' ? '#DCF8C6' : '#ECECEC',
                  color: '#333',
                }}
              >
                {msg.text}
              </span>
            </div>
          )):<p className='flex flex-wrap'>Please click on start New Chat to begin the conversation.</p>}
        </div>

        <div style={{ display: 'flex' }}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            style={{
              width: 'calc(100% - 70px)',
              padding: '10px',
              marginRight: '10px',
              borderRadius: '5px',
              border: '1px solid #ccc',
            }}
          />
          <button
            onClick={handleSendMessage}
            style={{
              padding: '10px 20px',
              borderRadius: '5px',
              border: 'none',
              backgroundColor: '#007BFF',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
