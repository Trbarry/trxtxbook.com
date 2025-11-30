import React from 'react';
import { motion } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const crtVariants = {
    initial: {
      opacity: 0,
      scale: 0.96,
      filter: "blur(4px) brightness(0.2) contrast(1.2)",
      y: 10
    },
    animate: {
      opacity: 1,
      scale: 1,
      filter: "blur(0px) brightness(1) contrast(1)",
      y: 0,
      transition: {
        // Courbe "Elastic" modérée pour un effet de mise sous tension mécanique
        type: "spring",
        mass: 0.5,
        stiffness: 120,
        damping: 15,
        duration: 0.4
      }
    },
    exit: {
      opacity: 0,
      scale: 1.02,
      filter: "blur(8px) brightness(1.5)", // Flash de sortie
      transition: {
        duration: 0.2,
        ease: "easeIn"
      }
    }
  };

  return (
    <motion.div
      variants={crtVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full h-full origin-center" // Important pour que le scale parte du milieu
    >
      {children}
    </motion.div>
  );
};