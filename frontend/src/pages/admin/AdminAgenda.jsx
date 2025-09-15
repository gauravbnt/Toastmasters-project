import React from 'react';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';

const AdminAgenda = () => {
  return (
    <motion.div 
      className="p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center mb-6">
        <FileText className="h-8 w-8 text-indigo-600 mr-3" />
        <h1 className="text-2xl font-bold text-gray-800">Agenda Management</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="max-w-md mx-auto">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Coming Soon</h2>
          <p className="text-gray-500 mb-6">
            We're working hard to bring you the Agenda Management feature. 
            This section will be available in an upcoming update.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminAgenda;
