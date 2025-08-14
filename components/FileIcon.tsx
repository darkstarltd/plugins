
import React from 'react';
import { FileCodeIcon, Code2Icon, FileJsonIcon, FileTextIcon, Css3Icon } from './icons';

interface FileIconProps {
  filename: string;
  className?: string;
}

const FileIcon: React.FC<FileIconProps> = ({ filename, className = 'w-5 h-5' }) => {
  const extension = filename.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'ts':
    case 'tsx':
    case 'js':
    case 'jsx':
      return <Code2Icon className={`${className} text-[#4FC1F0]`} />;
    case 'json':
      return <FileJsonIcon className={`${className} text-[#F0DE6D]`} />;
    case 'md':
    case 'txt':
      return <FileTextIcon className={`${className} text-[#A6B2C0]`} />;
    case 'css':
    case 'scss':
      return <Css3Icon className={`${className} text-[#68217A]`} />;
    default:
      return <FileCodeIcon className={`${className}`} />;
  }
};

export default FileIcon;
