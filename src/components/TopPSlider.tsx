// TemperatureSlider.tsx
import React from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

interface TopPSliderProps {
  id: string;
  value: number | null;
  onValueChange: (value: number | null) => void;
}

const topPMarks = {
  '0': {
    label: <strong>0</strong>,
  },
  0.25: '0.25',
  0.5: '0.5',
  0.75: '0.75',
  1: {
    label: <strong>1.0</strong>,
  },
};


const TopPSlider: React.FC<TopPSliderProps> = ({ value, onValueChange }) => {
  const handleChange = (value: number | number[] | null) => {
    // Since your application expects a single number, ensure only a number is handled
    if (value === null) {
      onValueChange(null);
    } if (typeof value === 'number') {
      onValueChange(value);
    } else {
      // This branch should not be hit based on your current usage,
      // but it's here to satisfy TypeScript's checks and handle possible future range slider use cases.
      // Handle appropriately or log a warning/error as needed.
      console.warn("Unexpected value type", value);
    }
  };

  return (
    <Slider
      className={'mr-2 ml-2 mb-6'}
      min={0}
      max={1}
      step={0.1}
      value={value === null ? 1 : value}
      onChange={handleChange}
      marks={topPMarks}
      included={false}
    />
  );
};

export default TopPSlider;
