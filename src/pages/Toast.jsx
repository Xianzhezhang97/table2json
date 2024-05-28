import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const Toast = ({ message, duration }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        clearTimeout(timer);
      }, duration);
    }
  }, [message, duration]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: message ? 1 : 0, scale: message ? 1 : 0 }}
      exit={{ opacity: 0, scale: 0 }}
      className={`fixed bottom-4  bg-gray-800 text-white text-center rounded py-2 px-4 left-[45%] right-[45%] z-50`}
    >
      {message}
    </motion.div>
  );
};

export default Toast;
