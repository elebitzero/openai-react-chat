import React, {useContext, useEffect, useRef, useState} from 'react';
import {SpeakerWaveIcon, StopCircleIcon} from '@heroicons/react/24/outline';
import {SpeechSettings} from '../models/SpeechSettings';
import {SpeechService} from '../service/SpeechService';
import {RotatingLines} from 'react-loader-spinner';
import {UserContext} from '../UserContext';
import {iconProps} from "../svg";
import {useTranslation} from "react-i18next";
import "./Button.css";

interface TextToSpeechButtonProps {
    content: string;
}

const TextToSpeechButton: React.FC<TextToSpeechButtonProps> = ({content}) => {
    const {t} = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioUrl, setAudioUrl] = useState('');
    const audioRef = useRef(new Audio());
    // Use UserContext to get userSettings
    const {userSettings} = useContext(UserContext);

    // Construct speechSettings from userSettings with defaults
    const speechSettings: SpeechSettings = {
        id: userSettings.speechModel || 'tts-1',
        voice: userSettings.speechVoice || 'alloy',
        speed: userSettings.speechSpeed || 1.0,
    };

    const fetchAudio = async () => {
        setIsLoading(true);
        try {
            const url = await SpeechService.textToSpeech(content, speechSettings);
            setAudioUrl(url);
            audioRef.current.src = url;
            audioRef.current.play();
            setIsPlaying(true);
        } catch (error) {
            console.error('Error fetching audio:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClick = () => {
        if (!isPlaying && !isLoading) {
            if (audioUrl) {
                audioRef.current.play();
            } else {
                fetchAudio();
            }
            setIsPlaying(true);
        } else if (isPlaying) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsPlaying(false);
        }
    };

    useEffect(() => {
        audioRef.current.onended = () => {
            setIsPlaying(false);
        };
    }, []);

    return (
        <button onClick={handleClick} disabled={isLoading}
                className="chat-action-button text-gray-400 inline-flex items-center justify-center p-2">
            {isLoading ? (
                <RotatingLines
                    ariaLabel="loading-indicator"
                    width="16"
                    strokeWidth="1"
                    strokeColor="black"
                />
            ) : isPlaying ? (
                <StopCircleIcon {...iconProps}  />
            ) : (
                <SpeakerWaveIcon {...iconProps}  />
            )}
        </button>
    );
};

export default TextToSpeechButton;
