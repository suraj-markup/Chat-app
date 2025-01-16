import React, { useState, useEffect } from 'react';

const ChatBox = ({ socket,user }) => {
  const curruser=user;
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [sessions, setSessions] = useState([]); // To store session list
  const [selectedSession, setSelectedSession] = useState(null); // To store the selected session
  const [currentSessionId, setCurrentSessionId] = useState(null); // To store the current session ID

  // console.log(user);
  useEffect(() => {
    // Listen for the session ID when a new chat is started
    socket.on('newSessionStarted', ({ sessionId }) => {
      setCurrentSessionId(sessionId); // Save the new session ID
    });

    socket.emit('getSessionList',{user:curruser}); // Request the session list from the server
    socket.on('sessionList', (sessionList) => {
      setSessions(sessionList); // Store the list of sessions
      // console.log(sessions);
    });

    // Listen for chat history when switching sessions
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

    // Listen for incoming messages from the server
    socket.on('receiveMessage', ({ message, sender }) => {
      setMessages(prevMessages => [
        ...prevMessages,
        { type: 'received', text: message, sender },
      ]);
    });

    // Cleanup listeners when the component is unmounted or socket changes
    return () => {
      socket.off('newSessionStarted');
      socket.off('loadChatHistory');
      socket.off('receiveMessage');
      socket.off('sessionList');
    };
  }, [socket,curruser]);

  // Trigger the start of a new chat session
  const handleStartNewChat = () => {
    socket.emit('startNewChat', { user: curruser }); // Send user object when starting a new chat
  };

  // Send a message to the server
  const handleSendMessage = () => {
    if (message.trim() && currentSessionId) {
      socket.emit('sendMessage', { content: message, sender: user, sessionId: currentSessionId });

      // Update the UI to reflect the sent message
      setMessages(prevMessages => [
        ...prevMessages,
        { type: 'sent', text: message },
      ]);

      setMessage(''); // Clear the input field
    }
  };

  // Handle session click to load chat history for the selected session
  const handleSessionClick = (sessionId) => {
    setCurrentSessionId(sessionId); // Set the current session ID
    socket.emit('loadChatHistoryForSession', sessionId); // Fetch chat history for the selected session
  };

  return (
    <div style={{ display: 'flex', maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <div style={{ width: '200px', marginRight: '20px', borderRight: '1px solid #ccc' }}>
        <h4>Sessions</h4>
        <button
          onClick={handleStartNewChat}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: '#fff',
            marginBottom: '20px',
            borderRadius: '5px',
            border: 'none',
          }}
        >
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
                <strong>Session {session.sessionId}</strong>
                <br />
                {session.lastMessage ? <small>Last message: {session.lastMessage}</small> : null}
                <br />
                <small>Messages: {session.messagesCount}</small>
              </li>
            ))
          ) : (
            <li>No sessions available</li>
          )}
        </ul>
      </div>

      <div style={{ width: '100%' }}>
        <div
          className="chat-messages"
          style={{
            border: '1px solid #ccc',
            borderRadius: '10px',
            padding: '10px',
            maxHeight: '300px',
            overflowY: 'auto',
            marginBottom: '10px',
          }}
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
          )):<p>Please click on start New Chat to begin the conversation.</p>}
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
