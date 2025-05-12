import React from 'react';

export default function StatCard({ title, value, icon: Icon, color }) {
  const colorClasses = {
    blue: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
    yellow: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300',
    red: 'bg-red-500/10 border-red-500/30 text-red-300',
  };
  return (
    <div className={`p-5 bg-white/5 backdrop-blur-sm border ${colorClasses[color]} rounded-lg shadow-md flex items-center justify-between`}>
      <div>
        <p className="text-sm font-medium text-gray-400 uppercase">{title}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>
      <div className={`p-3 rounded-full ${colorClasses[color].split(' ')[0]}`}>
        <Icon className={`w-6 h-6 ${colorClasses[color].split(' ')[2]}`} />
      </div>
    </div>
  );
}