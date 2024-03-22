import React from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import {useTranslation} from 'react-i18next';

interface TemperatureSliderProps {
  id: string;
  value: number | null;
  onValueChange: (value: number | null) => void;
}

const temperatureMarks = {
  '0': {
    label: <strong>0</strong>,
  },
  0.5: '0.5',
  1.0: '1.0',
  1.5: '1.5',
  2: {
    label: <strong>2</strong>,
  },
};

const TemperatureSlider: React.FC<TemperatureSliderProps> = ({value, onValueChange}) => {

  const {t} = useTranslation();
  const handleChange = (value: number | number[] | null) => {
    // Since your application expects a single number, ensure only a number is handled
    if (value === null) {
      onValueChange(null);
    }
    if (typeof value === 'number') {
      onValueChange(value);
    } else {
      // This branch should not be hit based on your current usage,
      // but it's here to satisfy TypeScript's checks and handle possible future range slider use cases.
      // Handle appropriately or log a warning/error as needed.
      console.warn("Unexpected value type", value);
    }
  };

  return (
      <div id="temperature">
        <p className='mb-2'>Higher values like 0.8 will make the output more random, while lower values like 0.2
          will make it more focused and deterministic.
          We recommend altering this or top_p but not both.</p>
        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '2px'}}>
                <span className='text-gray-600'
                      style={{alignSelf: 'flex-start', fontSize: '12px'}}>{t('deterministic-label')}</span>
          <span className='text-gray-600'
                style={{alignSelf: 'flex-end', fontSize: '12px'}}>{t('creative-label')}</span>
        </div>
        <Slider
            className={'w-auto mr-2 ml-2 mb-6'}
            min={0}
            max={2}
            step={0.1}
            value={value === null ? 1 : value}
            onChange={handleChange}
            marks={temperatureMarks}
            included={false}
        />
      </div>
  );
};

export default TemperatureSlider;
