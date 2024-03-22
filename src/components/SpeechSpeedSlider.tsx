import React from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import {useTranslation} from 'react-i18next';

interface SpeechSpeedSliderProps {
  id: string;
  value: number | null;
  onValueChange: (value: number | null) => void;
}

const speechSpeedMarks = {
  0.25: '0.25x',
  1: '1x',
  2: '2x',
  3: '3x',
  4: {
    label: <strong>4x</strong>,
  },
};

const SpeechSpeedSlider: React.FC<SpeechSpeedSliderProps> = ({value, onValueChange}) => {
  const {t} = useTranslation();
  const handleChange = (value: number | number[] | null) => {
    if (value === null) {
      onValueChange(null);
    }
    if (typeof value === 'number') {
      onValueChange(value);
    } else {
      console.warn("Unexpected value type", value);
    }
  };

  return (
      <div id="speed">
        <p className='mb-2'>Adjust the speech speed to your preference. Lower values will slow down the speech,
          while higher values will speed it up.</p>
        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '2px'}}>
                <span className='text-gray-600'
                      style={{alignSelf: 'flex-start', fontSize: '12px'}}>{t('slower-label')}</span>
          <span className='text-gray-600'
                style={{alignSelf: 'flex-end', fontSize: '12px'}}>{t('faster-label')}</span>
        </div>
        <Slider
            className={'w-auto mr-2 ml-2 mb-6'}
            min={0.25}
            max={4}
            step={0.25}
            value={value === null ? 1 : value}
            onChange={handleChange}
            marks={speechSpeedMarks}
            included={false}
        />
      </div>
  );
};

export default SpeechSpeedSlider;
