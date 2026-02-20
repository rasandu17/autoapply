import { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Paperclip, 
  Sparkles, 
  User, 
  Menu, 
  Plus, 
  MessageSquare, 
  Box, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

/* ─────────────────────────────────────────────────────────────
   Chat Components
   ───────────────────────────────────────────────────────────── */

const UserMessage = ({ content, image }) => (
  <div className="message message--user">
    <div className="message-avatar">
      <User size={20} color="#444746" />
    </div>
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

const AIMessage = ({ result, loading, error }) => (
  <div className="message message--ai">
    <div className="message-avatar message-avatar--ai">
      <Sparkles size={18} color="white" />
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
          
          {/* Email Draft Section would go here in a refined UI, maybe as an accordion or separate block */}
        </div>
      ) : null}
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   Main App Component
   ───────────────────────────────────────────────────────────── */
function App() {
  // State
  const [inputObj, setInputObj] = useState({ text: '', file: null });
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const fileInputRef = useRef(null);
  const scrollRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, loading]);

  /* ── Handlers ── */
  const handleFileSelect = (e) => {
    if (e.target.files[0]) {
      setInputObj({ ...inputObj, file: e.target.files[0] });
    }
  };

  const handleSend = async () => {
    if (!inputObj.text.trim() && !inputObj.file) return;

    // 1. Add User Message
    const userMsg = { 
      role: 'user', 
      content: inputObj.text, 
      image: inputObj.file 
    };
    
    // 2. Add Temporary Loading AI Message
    setChatHistory(prev => [...prev, userMsg]);
    setLoading(true);
    
    // Clear Input
    const currentFile = inputObj.file;
    const currentText = inputObj.text;
    setInputObj({ text: '', file: null });

    try {
      const formData = new FormData();
      if (currentFile) formData.append('image', currentFile);
      else             formData.append('jobText', currentText);

      const res = await fetch(`${API_URL}/analyze`, { method: 'POST', body: formData });
      const data = await res.json();

      if (data.error) throw new Error(data.error);

      // 3. Add AI Success Message
      setChatHistory(prev => [
        ...prev, 
        { role: 'ai', result: data }
      ]);

    } catch (err) {
      // Add Error Message
      setChatHistory(prev => [
        ...prev, 
        { role: 'ai', error: err.message }
      ]);
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

  /* ── Render ── */
  return (
    <div className="app-container">
      
      {/* ── Sidebar ── */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu size={24} color="#444746" />
          </div>
          {sidebarOpen && <span className="logo-text">AutoApply</span>}
        </div>
        
        {sidebarOpen && (
          <div className="new-chat-btn" onClick={() => setChatHistory([])}>
             <Plus size={20} />
             <span>New analysis</span>
          </div>
        )}

        <div className="recent-list">
          {sidebarOpen && <p className="section-title">Recent</p>}
          {/* Mock History Items */}
          {sidebarOpen && (
            <>
              <div className="history-item"><MessageSquare size={16}/> Frontend Dev Job...</div>
              <div className="history-item"><MessageSquare size={16}/> Backend Engineer...</div>
            </>
          )}
        </div>
        
        <div className="sidebar-footer">
            <div className={`user-pill ${!sidebarOpen && 'collapsed'}`}>
                <div className="user-avatar-small">R</div>
                {sidebarOpen && <div className="user-info">
                    <span className="name">Ravindu</span>
                    <span className="plan">Pro Plan</span>
                </div>}
            </div>
        </div>
      </aside>

      {/* ── Main Chat Area ── */}
      <main className="main-content">
        
        {/* Top Mobile/Header */}
        {!sidebarOpen && (
           <div className="mobile-header">
              <div className="menu-btn" onClick={() => setSidebarOpen(true)}>
                <Menu size={24} color="#444746" />
              </div>
              <span className="logo-text">AutoApply AI</span>
           </div>
        )}

        {/* Scrollable Feed */}
        <div className="chat-feed" ref={scrollRef}>
          {chatHistory.length === 0 ? (
            /* Empty State / Welcome */
            <div className="welcome-screen">
               <div className="logo-large">
                  <Sparkles size={42} color="#0b57d0" strokeWidth={1.5} />
               </div>
               <h1>Hello, Ravindu</h1>
               <p className="subtitle">How can I help analyze your next job opportunity?</p>
               
               <div className="suggestions">
                  <div className="suggestion-card">
                    <Box size={20} className="suggestion-icon"/>
                    <p>Analyze compatibility for a <b>Frontend Engineer</b> role</p>
                  </div>
                  <div className="suggestion-card">
                    <Paperclip size={20} className="suggestion-icon"/>
                    <p>Upload a screenshot of a <b>LinkedIn Job Post</b></p>
                  </div>
               </div>
            </div>
          ) : (
            /* Message List */
            <div className="message-list">
               {chatHistory.map((msg, i) => (
                 msg.role === 'user' 
                   ? <UserMessage key={i} content={msg.content} image={msg.image} />
                   : <AIMessage key={i} result={msg.result} error={msg.error} />
               ))}
               {loading && <AIMessage loading={true} />}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="input-area-wrapper">
           <div className="input-container">
              <div className="icon-btn" onClick={() => fileInputRef.current?.click()}>
                 <Paperclip size={22} color="#444746" />
                 {inputObj.file && <span className="file-badge">1</span>}
              </div>
              <input 
                 type="file" 
                 ref={fileInputRef} 
                 style={{display: 'none'}} 
                 accept="image/*"
                 onChange={handleFileSelect}
              />
              
              <textarea 
                placeholder={inputObj.file ? "Image attached. Add context..." : "Paste job description or upload image..."}
                value={inputObj.text}
                onChange={(e) => setInputObj({...inputObj, text: e.target.value})}
                onKeyDown={handleKeyPress}
                rows={1}
              />
              
              <div className={`icon-btn send-btn ${(!inputObj.text && !inputObj.file) ? 'disabled' : ''}`} onClick={handleSend}>
                 <Send size={20} color={(!inputObj.text && !inputObj.file) ? "#e3e3e3" : "white"} />
              </div>
           </div>
           <p className="disclaimer">
             AutoApply can make mistakes. Please review generated emails.
           </p>
        </div>

      </main>
    </div>
  );
}

export default App;
