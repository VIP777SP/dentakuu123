'use client';
import { useState, useEffect, useCallback } from 'react';
import Image from "next/image";
import styles from "./page.module.css";

export default function Calculator() {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [sounds, setSounds] = useState<{ [key: string]: HTMLAudioElement | null }>({
    number: null,
    operator: null,
    equals: null,
    clear: null
  });
  const [volume, setVolume] = useState(0.5);

  // 音声の初期化を修正
  const initializeAudio = useCallback(() => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const audioElements = {
      number: new Audio('/sounds/number.mp3'),
      operator: new Audio('/sounds/operator.mp3'),
      equals: new Audio('/sounds/equals.mp3'),
      clear: new Audio('/sounds/clear.mp3')
    };

    // 音声ファイルをプリロード
    Object.values(audioElements).forEach(audio => {
      audio.load();
    });

    setSounds(audioElements);
  }, []);

  // ユーザーインタラクション後に音声を初期化
  useEffect(() => {
    const handleFirstInteraction = () => {
      initializeAudio();
      document.removeEventListener('click', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);
    return () => document.removeEventListener('click', handleFirstInteraction);
  }, [initializeAudio]);

  // 音声再生関数を修正
  const playSound = useCallback((soundType: 'number' | 'operator' | 'equals' | 'clear') => {
    if (sounds[soundType]) {
      try {
        sounds[soundType]!.currentTime = 0;
        const playPromise = sounds[soundType]!.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error('Sound play error:', error);
          });
        }
      } catch (error) {
        console.error('Sound error:', error);
      }
    }
  }, [sounds]);

  useEffect(() => {
    Object.values(sounds).forEach(sound => {
      if (sound) sound.volume = volume;
    });
  }, [volume, sounds]);

  const handleNumber = (num: string) => {
    playSound('number');
    setDisplay(display === '0' ? num : display + num);
  };

  const handleOperator = (op: string) => {
    playSound('operator');
    setEquation(display + ' ' + op + ' ');
    setDisplay('0');
  };

  const calculate = () => {
    try {
      const result = eval(equation + display);
      playSound('equals');
      setDisplay(String(result));
      setEquation('');
    } catch (error) {
      setDisplay('Error');
    }
  };

  const clear = () => {
    playSound('clear');
    setDisplay('0');
    setEquation('');
  };

  // または、複数フォーマットをサポートする場合：
  const createAudio = (name: string) => {
    const audio = new Audio();
    const sources = [
      `/sounds/${name}.mp3`,
      `/sounds/${name}.ogg`,
      `/sounds/${name}.wav`
    ];
    
    // 最初に再生可能なフォーマットを使用
    for (const source of sources) {
      try {
        audio.src = source;
        if (audio.canPlayType(getMediaType(source)) !== '') {
          return audio;
        }
      } catch (e) {
        console.log(`Failed to load: ${source}`);
      }
    }
    return audio;
  };

  const getMediaType = (source: string) => {
    const ext = source.split('.').pop();
    switch (ext) {
      case 'mp3': return 'audio/mpeg';
      case 'ogg': return 'audio/ogg';
      case 'wav': return 'audio/wav';
      default: return '';
    }
  };

  useEffect(() => {
    setSounds({
      number: createAudio('number'),
      operator: createAudio('operator'),
      equals: createAudio('equals'),
      clear: createAudio('clear')
    });
  }, []);

  // デバッグ用のコードを追加
  useEffect(() => {
    const audio = new Audio('/sounds/number.mp3');
    console.log('Audio loaded:', audio);
    audio.play().catch(e => console.error('Audio play error:', e));
  }, []);

  // プラスマイナス反転の処理を追加
  const toggleSign = () => {
    playSound('operator');
    if (display === '0') return;
    setDisplay(display.startsWith('-') ? display.slice(1) : '-' + display);
  };

  // パーセント計算の処理を追加
  const calculatePercent = () => {
    playSound('operator');
    try {
      // 単独の数値の場合は100で割る
      if (!equation) {
        const value = parseFloat(display) / 100;
        setDisplay(String(value));
        return;
      }
      
      // 計算式の途中の場合は、直前の数値のパーセントを計算
      const parts = equation.trim().split(' ');
      const prevNumber = parseFloat(parts[0]);
      const operator = parts[1];
      const currentNumber = parseFloat(display) / 100;
      
      let result;
      switch (operator) {
        case '+':
        case '-':
          // 加減算の場合は、前の数値のパーセントを計算
          result = currentNumber * prevNumber;
          break;
        case '*':
        case '/':
          // 乗除算の場合は、そのまま100で割った値を使用
          result = currentNumber;
          break;
        default:
          result = parseFloat(display) / 100;
      }
      
      setDisplay(String(result));
    } catch (error) {
      setDisplay('Error');
    }
  };

  return (
    <div className={styles.calculator}>
      {/* デバッグ用のテストボタンを追加 */}
      <div className={styles.debug}>
        <button onClick={() => {
          console.log('Testing sounds...');
          ['number', 'operator', 'equals', 'clear'].forEach(type => {
            console.log(`Testing ${type} sound:`, sounds[type as keyof typeof sounds]);
            playSound(type as 'number' | 'operator' | 'equals' | 'clear');
          });
        }}>
          Test Sounds
        </button>
      </div>

      <div className={styles.settings}>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className={styles.volumeSlider}
        />
      </div>
      <div className={styles.display}>
        <div className={styles.equation}>{equation}</div>
        <div className={styles.current}>{display}</div>
      </div>
      
      <div className={styles.buttons}>
        {/* 1段目 */}
        <button onClick={clear} className={styles.clear}>C</button>
        <button onClick={toggleSign} className={styles.operator}>±</button>
        <button onClick={calculatePercent} className={styles.operator}>%</button>
        <button onClick={() => handleOperator('/')} className={styles.operator}>/</button>

        {/* 2段目 */}
        <button onClick={() => handleNumber('7')}>7</button>
        <button onClick={() => handleNumber('8')}>8</button>
        <button onClick={() => handleNumber('9')}>9</button>
        <button onClick={() => handleOperator('*')} className={styles.operator}>×</button>

        {/* 3段目 */}
        <button onClick={() => handleNumber('4')}>4</button>
        <button onClick={() => handleNumber('5')}>5</button>
        <button onClick={() => handleNumber('6')}>6</button>
        <button onClick={() => handleOperator('-')} className={styles.operator}>-</button>

        {/* 4段目 */}
        <button onClick={() => handleNumber('1')}>1</button>
        <button onClick={() => handleNumber('2')}>2</button>
        <button onClick={() => handleNumber('3')}>3</button>
        <button onClick={() => handleOperator('+')} className={styles.operator}>+</button>

        {/* 5段目 */}
        <button onClick={() => handleNumber('0')} className={styles.zero}>0</button>
        <button onClick={() => handleNumber('.')}>.</button>
        <button onClick={calculate} className={styles.equals}>=</button>
      </div>
    </div>
  );
}
