"use client"

import { motion } from "framer-motion"
import { Copyright } from 'lucide-react'

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-primary text-primary-foreground mt-auto"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center">
            <Copyright className="h-4 w-4 mr-1" />
            <span>2025 OnVaSRouler</span>
          </div>
          <motion.a
            href="https://www.youtube.com/watch?v=lYBUbBu4W08"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary-foreground/80 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Terms
          </motion.a>
          <motion.a
            href="https://en.wikipedia.org/wiki/Never_Gonna_Give_You_Up"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary-foreground/80 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Privacy
          </motion.a>
          <motion.a
            href="https://github.com/onvasrouler/AREA/wiki"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary-foreground/80 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Docs
          </motion.a>
          <motion.a
            href="https://github.com/onvasrouler/AREA"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary-foreground/80 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Contact
          </motion.a>
          <motion.a
            href={import.meta.env.VITE_MOBILE_APP_URL || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary-foreground/80 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Download mobile version
          </motion.a>
        </div>
      </div>
    </motion.footer>
  )
}

