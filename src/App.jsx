import { useState } from 'react'
import './App.css'
import styles from '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';

const API_KEY = import.meta.env.VITE_GPT_API_KEY

function App() {
  const [typing, setTyping] = useState(false)
  const [messages, setMessages] = useState([
    {
      message: "How can I help you today",
      sender: "ChatGPT"
    }
  ])

  const handleSend = async (message) => {
    const newMessage = {
      message: message,
      sender: "user",
      direction: "outgoing"
    }

    const newMessages = [...messages, newMessage]
    setMessages(newMessages)
    setTyping(true)
    await processMessageToChatGPT(newMessages)
  }

  const processMessageToChatGPT = async (chat) => {

    let msgsForGpt = chat.map(msgObj => {
      let role = ""
      if (msgObj.sender === "ChatGPT")
        role = "assistant";
      else role = "user"
      return { role: role, content: msgObj.message }
    })

    // const systemMessage = {
    //   role: "system",
    //   content: "Explain like iam freshman."
    // }

    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages": [
        // systemMessage,
        ...msgsForGpt
      ]
    }

    await fetch("https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(apiRequestBody)
      }).then(data => {
        return data.json()
      }).then(data => {
        setMessages([
          ...chat,
          {
            message: data.choices[0].message.content,
            sender: "ChatGPT"
          }
        ])
        setTyping(false)
      })
  }

  return (
    <div className='app'>
      <div style={{ position: "relative", height: "80vh", width: "500px" }}>
        <MainContainer>
          <ChatContainer>
            <MessageList
              scrollBehavior='smooth'
              typingIndicator={typing ? <TypingIndicator content="chatGPT is typing" /> : null}
            >
              {messages.map((message, i) => {
                return <Message key={i} model={message} />
              })}
            </MessageList>
            <MessageInput placeholder="Type message here" onSend={handleSend} />
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  )
}

export default App
