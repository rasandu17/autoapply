import { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Paperclip, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Mail,
  Loader2,
  Briefcase,
  ChevronRight
} from 'lucide-react';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

/*  Components  */

const UserMessage = ({ content, image }) => (
  <div className="message message--user">
    <div className="message-content">
      {image && (
        <div className="message-image-preview">
          <img src={URL.createObjectURL(image)} alt="User upload" />
        </div>
      )}
      {content && <p>{content}</p>}
    </div>
  </div>
);

const AIMessage = ({ result, loading, error, onSendEmail, sendingEmail }) => (
  <div className="message message--ai">
    <div className="message-avatar message-avatar--ai">
      <Sparkles size={18} color='#007AFF' />
    </div>
    <div className="message-content">
      {loading ? (
        <div className="typing-indicator">
          <span></span><span></span><span></span>
        </div>
      ) : error ? (
        <div className="error-box">
          <AlertCircle size={18} /> {error}
        </div>
      ) : result ? (
        <div className="analysis-result">
          <div className="result-header">
            <span className={`pill ${result.analysis.compatibility >= 70 ? 'pill--green' : 'pill--orange'}`}>
              {result.analysis.compatibility}% Match
            </span>
            <span className={`pill ${result.analysis.eligibility === 'Eligible' ? 'pill--green' : 'pill--red'}`}>
              {result.analysis.eligibility}
            </span>
          </div>

          <div className="result-section">
            <h4>Matching Skills</h4>
            <div className="tags">
              {result.analysis.matchingSkills.map((s, i) => (
                <span key={i} className="tag tag--match"><CheckCircle2 size={12}/> {s}</span>
              ))}
            </div>
          </div>

          <div className="result-section">
            <h4>Missing Skills</h4>
            <div className="tags">
              {result.analysis.missingSkills.map((s, i) => (
                <span key={i} className="tag tag--missing">{s}</span>
              ))}
            </div>
          </div>

          {result.email && (
            <div className="result-section">
              <h4>Generated Application Email</h4>
              <div className="email-body">
                {result.email}
              </div>
              {result.companyEmail && (
                <button 
                  className="send-email-btn"
                  onClick={() => onSendEmail(result)}
                  disabled={sendingEmail}
                >
                  {sendingEmail ? (
                    <><Loader2 size={16} className="spinner" /> Sending...</>
                  ) : (
                    <><Mail size={16} /> Send Application to {result.companyEmail}</>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      ) : null}
    </div>
  </div>
);

/*  Main App Component  */
function App() {
  const [inputObj, setInputObj] = useState({ text: '', file: null });
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  
  const fileInputRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, loading]);

  const handleFileSelect = (e) => {
    if (e.target.files[0]) {
      setInputObj({ ...inputObj, file: e.target.files[0] });
    }
  };

  const handleSend = async () => {
    if (!inputObj.text.trim() && !inputObj.file) return;

    const userMsg = { 
      role: 'user', 
      content: inputObj.text, 
      image: inputObj.file 
    };
    
    setChatHistory(prev => [...prev, userMsg]);
    setLoading(true);
    
    const currentFile = inputObj.file;
    const currentText = inputObj.text;
    setInputObj({ text: '', file: null });

    try {
      const formData = new FormData();
      if (currentFile) formData.append('image', currentFile);
      else             formData.append('jobText', currentText);

      const res = await fetch(`${API_URL}/analyze`, { method: 'POST', body: formData });
      
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to analyze job');
      }
      
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setChatHistory(prev => [...prev, { role: 'ai', result: data }]);

    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'ai', error: err.message }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSendEmail = async (result) => {
    if (!result.companyEmail) return;
    setSendingEmail(true);
    try {
      const res = await fetch(`${API_URL}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: result.companyEmail,
          subject: `Application for ${result.jobTitle}`,
          body: result.email
        })
      });
      if (!res.ok) throw new Error('Failed to send');
      alert('Email sent successfully!');
    } catch (err) {
      alert(`Failed to send email: ${err.message}`);
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="app-container">
      
      {/*  Main Chat Area  */}
      <main className="main-content">
        
        {/* Header - Simple Brand */}
        <div className="app-header">
           <span className="logo-text">AutoApply</span>
        </div>

        {/* Scrollable Feed */}
        <div className="chat-feed" ref={scrollRef}>
          {chatHistory.length === 0 ? (
            <div className="welcome-screen">
               <div style={{marginBottom: 20}}>
                  <div style={{
                      width: 80, height: 80, 
                      borderRadius: 24, 
                      background: 'linear-gradient(135deg, #007AFF, #5AC8FA)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 10px 30px rgba(0,122,255,0.3)'
                  }}>
                      <Sparkles size={40} color="white" />
                  </div>
               </div>
               <h1>Hello, Ravindu</h1>
               <p className="subtitle">Ready to find your next opportunity?</p>
               
               <div className="suggestions">
                  <div className="suggestion-card" onClick={() => setInputObj({...inputObj, text: "Analyze this text for a Senior React Developer role..."})}>
                    <Briefcase size={24} className="suggestion-icon"/>
                    <p>Analyze React Developer role</p>
                    <ChevronRight size={16} color="#C7C7CC" style={{marginTop:'auto'}}/>
                  </div>
                  <div className="suggestion-card" onClick={() => fileInputRef.current?.click()}>
                    <Paperclip size={24} className="suggestion-icon"/>
                    <p>Analyze from Screenshot</p>
                    <ChevronRight size={16} color="#C7C7CC" style={{marginTop:'auto'}}/>
                  </div>
               </div>
            </div>
          ) : (
            <div className="message-list">
               {chatHistory.map((msg, i) => (
                 msg.role === 'user' 
                   ? <UserMessage key={i} content={msg.content} image={msg.image} />
                   : <AIMessage 
                       key={i} 
                       result={msg.result} 
                       error={msg.error}
                       onSendEmail={handleSendEmail}
                       sendingEmail={sendingEmail}
                     />
               ))}
               {loading && <AIMessage loading={true} />}
            </div>
          )}
        </div>

        {/* Input Area (Fixed Bottom) */}
        <div className="input-area">
           <div className="input-container">
              <button className="icon-btn" onClick={() => fileInputRef.current?.click()}>
                 <Paperclip size={20} />
                 {inputObj.file && <div style={{
                     position:'absolute', top:8, right:8, width:8, height:8, 
                     borderRadius:'50%', background:'red'
                 }}/>}
              </button>
              <input 
                 type="file" 
                 ref={fileInputRef} 
                 style={{display: 'none'}} 
                 accept="image/*"
                 onChange={handleFileSelect}
              />
              
              <textarea 
                className="text-input"
                placeholder="Ask anything..."
                value={inputObj.text}
                onChange={(e) => setInputObj({...inputObj, text: e.target.value})}
                onKeyDown={handleKeyPress}
                rows={1}
              />
              
              <button className="send-btn" onClick={handleSend} disabled={!inputObj.text && !inputObj.file}>
                 <Send size={20} />
              </button>
           </div>
        </div>

      </main>
    </div>
  );
}

export default App;
