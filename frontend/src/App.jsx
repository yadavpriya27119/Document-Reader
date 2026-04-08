import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { AppCanvas } from './components/layout/AppCanvas';
import { UploadScreen } from './screens/UploadScreen';
import { ChatScreen } from './screens/ChatScreen';

export default function App() {
  const [showChat, setShowChat] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleUploadComplete = useCallback(({ fileName: name }) => {
    setFileName(name);
    setShowChat(true);
  }, []);

  return (
    <AppCanvas>
      <div className="min-h-dvh" style={{ perspective: 1400 }}>
        <motion.div
          className="relative min-h-dvh"
          style={{ transformStyle: 'preserve-3d' }}
          initial={false}
          animate={{ rotateY: showChat ? 180 : 0 }}
          transition={{ duration: 0.85, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Front: upload flow */}
          <div
            className="absolute inset-0 min-h-dvh overflow-y-auto"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(0deg)',
            }}
          >
            <UploadScreen onComplete={handleUploadComplete} />
          </div>

          {/* Back: chat (pre-rotated 180° so it faces viewer after parent flips) */}
          <div
            className="absolute inset-0 min-h-dvh overflow-y-auto"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <ChatScreen fileName={fileName} />
          </div>
        </motion.div>
      </div>
    </AppCanvas>
  );
}
