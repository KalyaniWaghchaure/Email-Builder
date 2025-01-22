import React from 'react';
import EmailBuilder from './components/EmailBuilder';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Email Template Builder</h1>
      </header>
      <main>
        <EmailBuilder />
      </main>
    </div>
  );
}

export default App;