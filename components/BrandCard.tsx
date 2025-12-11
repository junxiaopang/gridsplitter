import React from 'react';
import { Brand } from '../types';
import { Icons } from './Icon';

interface BrandCardProps {
  brand: Brand;
}

export const BrandCard: React.FC<BrandCardProps> = ({ brand }) => {
  return (
    <a 
      href={brand.url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="group relative flex flex-col justify-between p-3 h-24 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 hover:border-transparent dark:hover:border-transparent hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 overflow-hidden"
    >
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${brand.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
      
      <div className="flex justify-between items-start">
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${brand.color} flex items-center justify-center text-white shadow-sm`}>
           <span className="font-bold text-xs">{brand.name.substring(0, 1)}</span>
        </div>
        <Icons.ExternalLink className="w-3.5 h-3.5 text-slate-300 dark:text-slate-500 group-hover:text-slate-500 dark:group-hover:text-slate-300 transition-colors" />
      </div>

      <div>
        <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {brand.name}
        </h3>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-1 mt-0.5">
          {brand.description}
        </p>
      </div>
    </a>
  );
};