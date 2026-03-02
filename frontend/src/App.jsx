import { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Paperclip, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Mail,
  Loader2,
  Sheet,
  FileText,
  Briefcase
} from 'lucide-react';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

/*  Components  */

const PositionSelector = ({ positions, onSelectPosition, loading }) => {
  return (
    <div className="position-selector">
      <div className="selector-header">
        <h3>🎯 Found {positions.length} Open Positions</h3>
        <p className="subtitle">Select the position you're interested in</p>
      </div>
      
      <div className="position-options">
        {positions.map((position, idx) => (
          <button 
            key={idx}
            className="position-pill"
            onClick={() => onSelectPosition(position)}
            disabled={loading}
          >
            {position.title}
          </button>
        ))}
      </div>
    </div>
  );
};

const PositionCard = ({ position, companyEmail, onSendEmail, sendingEmail, jobText }) => {
  const [expanded, setExpanded] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [email, setEmail] = useState(position.email);
  const [editableCompanyEmail, setEditableCompanyEmail] = useState(companyEmail);
  
  const handleGenerateEmail = async () => {
    setLoadingEmail(true);
    try {
      const res = await fetch(`${API_URL}/generate-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobText,
          positionTitle: position.title
        })
      });
      const data = await res.json();
      if (data.email) {
        setEmail(data.email);
      }
    } catch (err) {
      console.error('Failed to generate email:', err);
      setEmail('error');
    } finally {
      setLoadingEmail(false);
    }
  };
  
  return (
    <div className="position-card">
      <div className="position-header" onClick={() => setExpanded(!expanded)}>
        <div>
          <h3 className="position-title">{position.title}</h3>
          <p className="position-description">{position.description}</p>
        </div>
        <div className="position-badges">
          <span className={`pill ${position.analysis.compatibility >= 70 ? 'pill--green' : 'pill--orange'}`}>
            {position.analysis.compatibility}% Match
          </span>
          <span className={`pill ${position.analysis.eligibility === 'Eligible' ? 'pill--green' : 'pill--red'}`}>
            {position.analysis.eligibility}
          </span>
        </div>
      </div>
      
      {expanded && (
        <div className="position-details">
          <div className="result-section">
            <h4>Matching Skills</h4>
            <div className="tags">
              {position.analysis.matchingSkills.map((s, i) => (
                <span key={i} className="tag tag--match"><CheckCircle2 size={12}/> {s}</span>
              ))}
            </div>
          </div>

          <div className="result-section">
            <h4>Missing Skills</h4>
            <div className="tags">
              {position.analysis.missingSkills.map((s, i) => (
                <span key={i} className="tag tag--missing">{s}</span>
              ))}
            </div>
          </div>

          <div className="result-section">
            <h4>Application Email <span className="edit-hint">✏️ Click to edit</span></h4>
            {!email ? (
              <button 
                className="generate-email-btn"
                onClick={handleGenerateEmail}
                disabled={loadingEmail}
              >
                {loadingEmail ? (
                  <><Loader2 size={16} className="spinner" /> Generating Email...</>
                ) : (
                  <><Sparkles size={16} /> Generate Application Email</>
                )}
              </button>
            ) : email === 'error' ? (
              <p className="email-error">Failed to generate email. Please try again.</p>
            ) : (
              <>
                <div className="email-recipient-field">
                  <label htmlFor="recipient-email">To:</label>
                  <input
                    type="email"
                    id="recipient-email"
                    className="recipient-email-input"
                    value={editableCompanyEmail}
                    onChange={(e) => setEditableCompanyEmail(e.target.value)}
                    placeholder="company@example.com"
                  />
                </div>
                <textarea 
                  className="email-body editable-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  rows={12}
                />
                {editableCompanyEmail && (
                  <button 
                    className="send-email-btn"
                    onClick={() => onSendEmail({ 
                      companyEmail: editableCompanyEmail, 
                      jobTitle: position.title, 
                      email: email 
                    })}
                    disabled={sendingEmail}
                  >
                    {sendingEmail ? (
                      <><Loader2 size={16} className="spinner" /> Sending...</>
                    ) : (
                      <><Mail size={16} /> Send Application</>
                    )}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

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

const CoverLetterMessage = ({ coverLetter, loading, error }) => {
  const [editedLetter, setEditedLetter] = useState(coverLetter || '');

  useEffect(() => {
    if (coverLetter) {
      setEditedLetter(coverLetter);
    }
  }, [coverLetter]);

  return (
    <div className="message message--ai">
      <div className="message-content">
        {loading ? (
          <div className="typing-indicator">
            <span></span><span></span><span></span>
          </div>
        ) : error ? (
          <div className="error-box">
            <AlertCircle size={18} /> {error}
          </div>
        ) : coverLetter ? (
          <div className="cover-letter-result">
            <h4 style={{marginBottom: '16px', color: 'var(--text-primary)'}}>
              <FileText size={20} style={{display: 'inline', verticalAlign: 'middle', marginRight: '8px'}} />
              Generated Cover Letter <span className="edit-hint">✏️ Editable</span>
            </h4>
            <textarea 
              className="email-body editable-email"
              value={editedLetter}
              onChange={(e) => setEditedLetter(e.target.value)}
              rows={14}
            />
            <div style={{marginTop: '16px', textAlign: 'center'}}>
              <button 
                className="copy-btn"
                onClick={() => {
                  navigator.clipboard.writeText(editedLetter);
                  alert('✅ Cover letter copied to clipboard!');
                }}
              >
                📋 Copy to Clipboard
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

const AIMessage = ({ result, loading, error, onSendEmail, sendingEmail, onSelectPosition, analyzingPosition, onStartNew, onAddToTracker, addingToTracker }) => {
  const [editedEmail, setEditedEmail] = useState(result?.email || '');
  const [editableCompanyEmail, setEditableCompanyEmail] = useState(result?.companyEmail || '');
  
  // Update editedEmail when result.email changes
  useEffect(() => {
    if (result?.email) {
      setEditedEmail(result.email);
    }
  }, [result?.email]);

  // Update editableCompanyEmail when result.companyEmail changes
  useEffect(() => {
    if (result?.companyEmail) {
      setEditableCompanyEmail(result.companyEmail);
    }
  }, [result?.companyEmail]);

  return (
    <div className="message message--ai">
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
                    <h4>Generated Application Email <span className="edit-hint">✏️ Editable</span></h4>
                    <div className="email-recipient-field">
                      <label htmlFor="recipient-email-multi">To:</label>
                      <input
                        type="email"
                        id="recipient-email-multi"
                        className="recipient-email-input"
                        value={editableCompanyEmail}
                        onChange={(e) => setEditableCompanyEmail(e.target.value)}
                        placeholder="company@example.com"
                      />
                    </div>
                    <textarea 
                      className="email-body editable-email"
                      value={editedEmail}
                      onChange={(e) => setEditedEmail(e.target.value)}
                      rows={12}
                    />
                    <div className="email-actions">
                      <div className="button-group">
                        {editableCompanyEmail && (
                          <button 
                            className="send-email-btn"
                            onClick={() => onSendEmail({ 
                              companyEmail: editableCompanyEmail, 
                              jobTitle: result.selectedPosition, 
                              email: editedEmail 
                            })}
                            disabled={sendingEmail}
                          >
                            {sendingEmail ? (
                              <><Loader2 size={16} className="spinner" /> Sending...</>
                            ) : (
                              <><Mail size={16} /> Send Application</>
                            )}
                          </button>
                        )}
                        <button 
                          className="tracker-btn"
                          onClick={() => onAddToTracker({
                            jobTitle: result.selectedPosition,
                            companyEmail: editableCompanyEmail,
                            matchPercentage: result.analysis?.compatibility
                          })}
                          disabled={addingToTracker}
                        >
                          {addingToTracker ? (
                            <><Loader2 size={16} className="spinner" /> Adding...</>
                          ) : (
                            <><Sheet size={16} /> Add to Tracker</>
                          )}
                        </button>
                      </div>
                      <button className="start-new-btn" onClick={onStartNew}>
                        ✨ Start New Application
                      </button>
                    </div>
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
                    <h4>Generated Application Email <span className="edit-hint">✏️ Editable</span></h4>
                    <div className="email-recipient-field">
                      <label htmlFor="recipient-email-single">To:</label>
                      <input
                        type="email"
                        id="recipient-email-single"
                        className="recipient-email-input"
                        value={editableCompanyEmail}
                        onChange={(e) => setEditableCompanyEmail(e.target.value)}
                        placeholder="company@example.com"
                      />
                    </div>
                    <textarea 
                      className="email-body editable-email"
                      value={editedEmail}
                      onChange={(e) => setEditedEmail(e.target.value)}
                      rows={12}
                    />
                    <div className="email-actions">
                      <div className="button-group">
                        {editableCompanyEmail && (
                          <button 
                            className="send-email-btn"
                            onClick={() => onSendEmail({...result, companyEmail: editableCompanyEmail, email: editedEmail})}
                            disabled={sendingEmail}
                          >
                            {sendingEmail ? (
                              <><Loader2 size={16} className="spinner" /> Sending...</>
                            ) : (
                              <><Mail size={16} /> Send Application</>
                            )}
                          </button>
                        )}
                        <button 
                          className="tracker-btn"
                          onClick={() => onAddToTracker({
                            jobTitle: result.jobTitle,
                            companyEmail: editableCompanyEmail,
                            matchPercentage: result.analysis?.compatibility
                          })}
                          disabled={addingToTracker}
                        >
                          {addingToTracker ? (
                            <><Loader2 size={16} className="spinner" /> Adding...</>
                          ) : (
                            <><Sheet size={16} /> Add to Tracker</>
                          )}
                        </button>
                      </div>
                      <button className="start-new-btn" onClick={onStartNew}>
                        ✨ Start New Application
                      </button>
                    </div>
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
  const [mode, setMode] = useState('analysis'); // 'analysis' or 'coverLetter'
  const [inputObj, setInputObj] = useState({ text: '', file: null });
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [analyzingPosition, setAnalyzingPosition] = useState(false);
  const [addingToTracker, setAddingToTracker] = useState(false);
  
  const fileInputRef = useRef(null);
  const scrollRef = useRef(null);

  const handleStartNew = () => {
    setChatHistory([]);
    setInputObj({ text: '', file: null });
    setLoading(false);
    setSendingEmail(false);
    setAnalyzingPosition(false);
    setAddingToTracker(false);
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    handleStartNew();
  };

  const handleAddToTracker = async (applicationData) => {
    setAddingToTracker(true);
    try {
      const res = await fetch(`${API_URL}/add-to-tracker`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(applicationData)
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to add to tracker');
      }
      
      alert('✅ Added to job tracker successfully!');
    } catch (err) {
      if (err.message.includes('not configured')) {
        alert('⚠️ Google Sheets tracking not configured.\n\nTo enable:\n1. Set up Google Service Account\n2. Add credentials file\n3. Set GOOGLE_SHEET_ID in .env');
      } else {
        alert(`Failed to add to tracker: ${err.message}`);
      }
    } finally {
      setAddingToTracker(false);
    }
  };

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
      if (mode === 'coverLetter') {
        // Cover Letter Generation Mode
        const formData = new FormData();
        if (currentFile) formData.append('image', currentFile);
        else             formData.append('jobText', currentText);

        const res = await fetch(`${API_URL}/generate-cover-letter`, { method: 'POST', body: formData });
        
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || 'Failed to generate cover letter');
        }
        
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        setChatHistory(prev => [...prev, { role: 'ai', coverLetter: data.coverLetter }]);

      } else {
        // Job Analysis Mode (existing flow)
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
      }

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
           <span className="logo-text" onClick={handleStartNew} style={{cursor: 'pointer'}}>AutoApply</span>
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
               <p className="subtitle">
                 {mode === 'analysis' ? 'Upload a job posting to get started' : 'Upload a job posting to generate cover letter'}
               </p>
               
               {/* Mode Selector */}
               <div className="mode-selector">
                 <button 
                   className={`mode-btn ${mode === 'analysis' ? 'mode-btn--active' : ''}`}
                   onClick={() => handleModeChange('analysis')}
                 >
                   <Briefcase size={18} />
                   Job Analysis
                 </button>
                 <button 
                   className={`mode-btn ${mode === 'coverLetter' ? 'mode-btn--active' : ''}`}
                   onClick={() => handleModeChange('coverLetter')}
                 >
                   <FileText size={18} />
                   Cover Letter
                 </button>
               </div>
            </div>
          ) : (
            <div className="message-list">
               {chatHistory.map((msg, i) => {
                 if (msg.role === 'user') {
                   return <UserMessage key={i} content={msg.content} image={msg.image} />;
                 } else if (msg.coverLetter || msg.error) {
                   return <CoverLetterMessage key={i} coverLetter={msg.coverLetter} error={msg.error} />;
                 } else {
                   return <AIMessage 
                     key={i} 
                     result={msg.result} 
                     error={msg.error}
                     onSendEmail={handleSendEmail}
                     sendingEmail={sendingEmail}
                     onSelectPosition={handleSelectPosition}
                     analyzingPosition={analyzingPosition}
                     onStartNew={handleStartNew}
                     onAddToTracker={handleAddToTracker}
                     addingToTracker={addingToTracker}
                   />;
                 }
               })}
               {loading && mode === 'coverLetter' && <CoverLetterMessage loading={true} />}
               {loading && mode === 'analysis' && <AIMessage loading={true} />}
            </div>
          )}
        </div>

        {/* Input Area (Fixed Bottom) - Hide after sending message */}
        {(() => {
          // Hide input after any message is sent
          const hasMessages = chatHistory.length > 0 || loading;
          
          return !hasMessages ? (
            <div className={`input-area ${chatHistory.length === 0 ? 'input-area--empty' : ''}`}>
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
          ) : null;
        })()}

      </main>
    </div>
  );
}

export default App;
