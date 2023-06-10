import { useState } from 'react'
import './App.css'
import styles from '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';
import { Configuration, OpenAIApi } from 'openai';


const API_KEY = import.meta.env.VITE_GPT_API_KEY

const configuration = new Configuration({
  apiKey: API_KEY
});
const openai = new OpenAIApi(configuration);

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

    try {
      const response = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [...msgsForGpt],
      })
      setMessages([
        ...chat,
        {
          message: response.data.choices[0].message.content,
          sender: "ChatGPT"
        }
      ])
    } catch (error) {
      if (error.response) {
        console.error(error.response.status, error.response.data);
      } else {
        console.error(`Error with OpenAI API request: ${error.message}`);
      }
    }
    setTyping(false)
  }

  return (
    <div className='app'>
      <div className='chat-container' style={{ position: "relative", height: "75vh", width: "450px" }}>
        <header className="chat-header">
          <h4>Chat with GPT</h4>
        </header>
        <MainContainer>
          <ChatContainer>
            <MessageList className='msglist' scrollBehavior='smooth'>
              {messages.map((message, i) => (
                <Message
                  key={i}
                  model={{
                    message: message.message,
                    sender: message.sender === 'ChatGPT' ? 'assistant' : 'user',
                    direction: message.direction
                  }}
                />
              ))}
              {typing && <TypingIndicator content='ChatGPT is typing' />}
            </MessageList>
            <MessageInput placeholder='Type message here' onSend={handleSend} />
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  );
}

export default App
