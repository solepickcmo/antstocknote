import React from 'react';
import './TagChip.css';

interface TagChipProps {
  label: string;
  type?: 'strategy' | 'emotion' | 'default';
  onClick?: () => void;
  selected?: boolean;
}

export const TagChip: React.FC<TagChipProps> = React.memo(({ label, type = 'default', onClick, selected }) => {
  const chipClass = `tag-chip ${type} ${selected ? 'selected' : ''} ${onClick ? 'clickable' : ''}`;
  return (
    <span className={chipClass} onClick={onClick}>
      {label}
    </span>
  );
});
