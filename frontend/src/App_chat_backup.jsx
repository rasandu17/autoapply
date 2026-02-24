import { useState, useRef } from 'react';
import { 
  Upload,
  FileText,
  Image as ImageIcon, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Mail,
  Loader2,
  Briefcase,
  ChevronRight,
  X,
  Check,
  Clock,
  RefreshCw
} from 'lucide-react';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

/* ========== COMPONENTS ========== */

// Progress Tracker Component
const ProgressTracker = ({ steps, currentStep }) => {
  return (
    <div className="progress-tracker">
      {steps.map((step, idx) => {
        const isCompleted = idx < currentStep;
        const isCurrent = idx === currentStep;
        const isPending = idx > currentStep;
        
        return (
          <div key={idx} className="progress-step">
            <div className={`step-indicator ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${isPending ? 'pending' : ''}`}>
              {isCompleted ? (
                <Check size={16} />
              ) : isCurrent ? (
                <Loader2 size={16} className="spinner" />
              ) : (
                <Clock size={16} />
              )}
            </div>
            <div className="step-info">
              <div className="step-title">{step}</div>
              {isCurrent && <div className="step-status">In progress...</div>}
              {isCompleted && <div className="step-status-done">Done</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Upload Zone Component
const UploadZone = ({ onFileSelect, onTextSubmit, file, text, setText, loading }) => {
  const fileInputRef = useRef(null);
  const [inputMode, setInputMode] = useState('file'); // 'file' or 'text'
  
  const handleSubmit = () => {
    if (inputMode === 'file' && file) {
      onFileSelect();
    } else if (inputMode === 'text' && text.trim()) {
      onTextSubmit();
    }
  };
  
  return (
    <div className="upload-zone">
      <div className="upload-mode-toggle">
        <button 
          className={`mode-btn ${inputMode === 'file' ? 'active' : ''}`}
          onClick={() => setInputMode('file')}
          disabled={loading}
        >
          <ImageIcon size={18} />
          <span>Upload Image</span>
        </button>
        <button 
          className={`mode-btn ${inputMode === 'text' ? 'active' : ''}`}
          onClick={() => setInputMode('text')}
          disabled={loading}
        >
          <FileText size={18} />
          <span>Paste Job Text</span>
        </button>
      </div>
      
      {inputMode === 'file' ? (
        <div className="file-upload-area">
          <input 
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files[0]) {
                onFileSelect(e.target.files[0]);
              }
            }}
            style={{ display: 'none' }}
          />
          
          {!file ? (
            <div className="upload-placeholder" onClick={() => fileInputRef.current?.click()}>
              <div className="upload-icon">
                <Upload size={32} />
              </div>
              <p className="upload-title">Drop job posting image here</p>
              <p className="upload-subtitle">or click to browse</p>
            </div>
          ) : (
            <div className="file-preview">
              <img src={URL.createObjectURL(file)} alt="Job posting" />
              <button className="remove-file-btn" onClick={() => onFileSelect(null)}>
                <X size={18} />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-input-area">
          <textarea 
            className="job-text-input"
            placeholder="Paste the job description here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            disabled={loading}
          />
        </div>
      )}
      
      <button 
        className="analyze-btn"
        onClick={handleSubmit}
        disabled={loading || (!file && !text.trim())}
      >
        {loading ? (
          <><Loader2 size={20} className="spinner" /> Analyzing...</>
        ) : (
          <><Sparkles size={20} /> Analyze Job Posting</>
        )}
      </button>
    </div>
  );
};

const AIMessage = ({ result, loading, error, onSendEmail, sendingEmail, onSelectPosition, analyzingPosition }) => {
  const [editedEmail, setEditedEmail] = useState(result?.email || '');
  
  // Update editedEmail when result.email changes
  useEffect(() => {
    if (result?.email) {
      setEditedEmail(result.email);
    }
  }, [result?.email]);
  
  return (
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
          {/* Position Selection View */}
          {result.needsSelection ? (
            <PositionSelector 
              positions={result.positions} 
              onSelectPosition={onSelectPosition}
              loading={analyzingPosition}
            />
          ) : result.multiplePositions ? (
            /* Selected Position Analysis */
            <div className="selected-position-result">
              <div className="result-header">
                <h3 className="selected-position-title">{result.selectedPosition}</h3>
                <div className="result-badges">
                  <span className={`pill ${result.analysis.compatibility >= 70 ? 'pill--green' : 'pill--orange'}`}>
                    {result.analysis.compatibility}% Match
                  </span>
                  <span className={`pill ${result.analysis.eligibility === 'Eligible' ? 'pill--green' : 'pill--red'}`}>
                    {result.analysis.eligibility}
                  </span>
                </div>
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
                  <textarea 
                    className="email-body email-editable"
                    value={editedEmail}
                    onChange={(e) => setEditedEmail(e.target.value)}
                    rows={18}
                  />
                  {result.companyEmail && (
                    <button 
                      className="send-email-btn"
                      onClick={() => onSendEmail({ 
                        companyEmail: result.companyEmail, 
                        jobTitle: result.selectedPosition, 
                        email: editedEmail 
                      })}
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
          ) : (
            /* Single Position View (Original) */
            <>
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
                  <textarea 
                    className="email-body email-editable"
                    value={editedEmail}
                    onChange={(e) => setEditedEmail(e.target.value)}
                    rows={18}
                  />
                  {result.companyEmail && (
                    <button 
                      className="send-email-btn"
                      onClick={() => onSendEmail({ 
                        companyEmail: result.companyEmail, 
                        jobTitle: result.jobTitle, 
                        email: editedEmail 
                      })}
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
            </>
          )}
        </div>
      ) : null}
    </div>
  </div>
  );
};

/*  Main App Component  */
function App() {
  const [inputObj, setInputObj] = useState({ text: '', file: null });
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [analyzingPosition, setAnalyzingPosition] = useState(false);
  
  const fileInputRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, loading, analyzingPosition]);

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

  const handleSelectPosition = async (position) => {
    setAnalyzingPosition(true);
    
    try {
      // Find the original result with jobText and companyEmail
      const originalResult = chatHistory[chatHistory.length - 1].result;
      
      const res = await fetch(`${API_URL}/analyze-position`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobText: originalResult.jobText,
          positionTitle: position.title,
          positionDescription: position.description
        })
      });
      
      if (!res.ok) throw new Error('Failed to analyze position');
      
      const data = await res.json();
      
      // Update the last AI message with selected position analysis
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = {
          role: 'ai',
          result: {
            ...originalResult,
            needsSelection: false,
            multiplePositions: true,
            selectedPosition: position.title,
            analysis: data.analysis,
            email: data.email
          }
        };
        return newHistory;
      });
      
    } catch (err) {
      alert(`Failed to analyze position: ${err.message}`);
    } finally {
      setAnalyzingPosition(false);
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
                       onSelectPosition={handleSelectPosition}
                       analyzingPosition={analyzingPosition}
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
