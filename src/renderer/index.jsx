import React from 'react';
import { createRoot } from 'react-dom/client';

function App() {
    const [status, setStatus] = React.useState('Idle');
    const [message, setMessage] = React.useState('');
    const cheddarRef = React.useRef(null);

    React.useEffect(() => {
        // Create a minimal cheddar shim to satisfy existing renderer.js APIs
        cheddarRef.current = {
            setStatus: text => setStatus(text),
        };
        // Expose minimal API expected by renderer.js
        window.cheddar = Object.assign(window.cheddar || {}, {
            setStatus: text => setStatus(text),
        });
        // Wire Ctrl/Cmd+Enter to mirror old shortcut
        const onKey = e => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                if (status !== 'Live') {
                    onStart();
                } else {
                    onScreenshot();
                }
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    const onStart = async () => {
        setStatus('Starting…');
        if (window.cheddar?.startCapture) {
            await window.cheddar.startCapture(5, 'medium');
            setStatus('Live');
        }
    };

    const onStop = () => {
        window.cheddar?.stopCapture?.();
        setStatus('Idle');
    };

    const onScreenshot = () => {
        window.captureManualScreenshot?.('medium');
    };

    const onSend = async () => {
        if (!message.trim()) return;
        await window.cheddar?.sendTextMessage?.(message.trim());
        setMessage('');
    };

    return (
        <div style={{ padding: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h1 style={{ margin: 0 }}>Cheating Daddy</h1>
                <div style={{ opacity: 0.7 }}>Status: {status}</div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button onClick={onStart}>Start</button>
                <button onClick={onStop}>Stop</button>
                <button onClick={onScreenshot}>Screenshot</button>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <input
                    style={{ flex: 1 }}
                    value={message}
                    placeholder="Send a prompt to Gemini…"
                    onChange={e => setMessage(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) onSend();
                    }}
                />
                <button onClick={onSend}>Send</button>
            </div>
        </div>
    );
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);


