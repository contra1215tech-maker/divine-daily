import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

export default function License() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen" style={{ background: 'transparent' }}>
      {/* Header */}
      <div className="sticky top-0 backdrop-blur-lg z-10 px-6 py-4" style={{
        backgroundColor: 'var(--nav-bg)',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full border-2 theme-text-primary flex items-center justify-center"
            style={{ borderColor: 'var(--text-light)' }}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold theme-text-primary">License</h1>
        </div>
      </div>

      <div className="px-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-3xl theme-card"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl theme-accent flex items-center justify-center">
              <FileText className="w-5 h-5 theme-text-primary" />
            </div>
            <h2 className="text-lg font-bold theme-text-primary">MIT License</h2>
          </div>

          <div className="space-y-4 text-sm theme-text-secondary leading-relaxed">
            <p>Copyright (c) 2024 AO Lab</p>

            <p>
              Permission is hereby granted, free of charge, to any person obtaining a copy
              of this software and associated documentation files (the "Software"), to deal
              in the Software without restriction, including without limitation the rights
              to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
              copies of the Software, and to permit persons to whom the Software is
              furnished to do so, subject to the following conditions:
            </p>

            <p>
              The above copyright notice and this permission notice shall be included in all
              copies or substantial portions of the Software.
            </p>

            <p className="font-medium theme-text-primary">
              THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
              IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
              FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
              AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
              LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
              OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
              SOFTWARE.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}