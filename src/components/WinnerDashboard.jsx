import React, { useState } from 'react';

export default function WinnerDashboard({ 
  p1Money = 0, 
  p2Money = 0, 
  p1Love = 0, 
  p2Love = 0,
  p1Name = '老公',
  p2Name = '老婆',
  p1Role = 'white_dog',
  p2Role = 'brown_dog',
  currency = 'TWD',
  lovePointRate = 25,
  exchangeRates,
  showSummary = true,
  showIndividualStats = true,
  onPartnerClick
}) {
  const [hoveredDog, setHoveredDog] = useState(null);

  const moneyDiff = p1Money - p2Money;
  const loveDiff = p1Love - p2Love;
  
  const p1Total = p1Money + (p1Love * lovePointRate);
  const p2Total = p2Money + (p2Love * lovePointRate);
  const totalDiff = p1Total - p2Total;

  const getCurrencySymbol = (code) => {
    if (code === 'TWD') return 'NT$';
    if (code === 'SGD') return 'S$';
    if (code === 'USD') return 'US$';
    if (code === 'CNY') return '¥';
    return 'NT$';
  };

  const symbol = getCurrencySymbol(currency);

  // --- SCALE ROTATION MATH ---
  const rates = exchangeRates || { TWD: 1.0, USD: 32.5, SGD: 24.0, CNY: 4.5 };
  const rate = rates[currency] || 1.0;
  
  // Calculate tilt angle: cap at 18 degrees to prevent excessive tilt.
  // Since totalDiff is in display currency, we convert to base TWD to use normalized tilt factor.
  const diffInBase = totalDiff * (currency === 'TWD' ? 1.0 : rate);
  const maxAngle = 18;
  const scalingFactor = 0.005; // same scaling factor as money
  const calculatedAngle = diffInBase * scalingFactor;
  const angle = Math.max(-maxAngle, Math.min(maxAngle, calculatedAngle));

  const rad = (angle * Math.PI) / 180;
  const L = 95; // half-arm length
  const fx = 150; // fulcrum X
  const fy = 65;  // fulcrum Y

  // Left and right pivot points
  const lx = fx - L * Math.cos(rad);
  const ly = fy + L * Math.sin(rad); 
  const rx = fx + L * Math.cos(rad);
  const ry = fy - L * Math.sin(rad); 

  // Speeches based on who is leading total contribution
  const getP1SpeechText = () => {
    if (totalDiff > 0) {
      return p1Role === 'white_dog' ? '付出超多！汪！🐶' : '付出超多！🐻';
    } else if (totalDiff < 0) {
      return p1Role === 'white_dog' ? '多謝伴侶！🐶' : '多謝伴侶！🐻';
    } else {
      return p1Role === 'white_dog' ? '完美平衡！🐶' : '完美平衡！🐻';
    }
  };

  const getP2SpeechText = () => {
    if (totalDiff < 0) {
      return p2Role === 'white_dog' ? '付出超多！汪！🐶' : '付出超多！🐻';
    } else if (totalDiff > 0) {
      return p2Role === 'white_dog' ? '多謝伴侶！🐶' : '多謝伴侶！🐻';
    } else {
      return p2Role === 'white_dog' ? '完美平衡！🐶' : '完美平衡！🐻';
    }
  };

  // --- SVG Badge Renderers ---
  const renderWhiteDogBadge = () => (
    <svg viewBox="0 0 100 80" style={styles.dogBadgeSvg}>
      <ellipse cx="50" cy="55" rx="20" ry="15" fill="#FFFFFF" stroke="var(--border-color)" strokeWidth="3.5" />
      <circle cx="34" cy="62" r="7" fill="#FFFFFF" stroke="var(--border-color)" strokeWidth="2.5" />
      <path d="M 30 55 Q 20 50 25 42" fill="none" stroke="var(--border-color)" strokeWidth="3.5" strokeLinecap="round" />
      <ellipse cx="30" cy="28" rx="6" ry="10" fill="#FFFFFF" stroke="var(--border-color)" strokeWidth="3.5" />
      <ellipse cx="70" cy="28" rx="6" ry="10" fill="#FFFFFF" stroke="var(--border-color)" strokeWidth="3.5" />
      <ellipse cx="50" cy="35" rx="20" ry="17" fill="#FFFFFF" stroke="var(--border-color)" strokeWidth="3.5" />
      <circle cx="43" cy="33" r="3" fill="var(--border-color)" />
      <circle cx="57" cy="33" r="3" fill="var(--border-color)" />
      <circle cx="38" cy="37" r="3.5" fill="#FFB7B2" opacity="0.9" />
      <circle cx="62" cy="37" r="3.5" fill="#FFB7B2" opacity="0.9" />
      <polygon points="48,37 52,37 50,40" fill="var(--border-color)" />
      <path d="M 47 43 Q 50 46 53 43" fill="none" stroke="var(--border-color)" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="44" cy="68" r="6" fill="#FFFFFF" stroke="var(--border-color)" strokeWidth="2.5" />
      <circle cx="56" cy="68" r="6" fill="#FFFFFF" stroke="var(--border-color)" strokeWidth="2.5" />
    </svg>
  );

  const renderGrayDogBadge = () => (
    <svg viewBox="0 0 100 80" style={styles.dogBadgeSvg}>
      <ellipse cx="50" cy="55" rx="20" ry="15" fill="#D4A373" stroke="var(--border-color)" strokeWidth="3.5" />
      <circle cx="34" cy="62" r="7" fill="#D4A373" stroke="var(--border-color)" strokeWidth="2.5" />
      <path d="M 30 55 Q 20 50 25 42" fill="none" stroke="var(--border-color)" strokeWidth="3.5" strokeLinecap="round" />
      <ellipse cx="30" cy="28" rx="6" ry="10" fill="#D4A373" stroke="var(--border-color)" strokeWidth="3.5" />
      <ellipse cx="70" cy="28" rx="6" ry="10" fill="#D4A373" stroke="var(--border-color)" strokeWidth="3.5" />
      <ellipse cx="50" cy="35" rx="20" ry="17" fill="#D4A373" stroke="var(--border-color)" strokeWidth="3.5" />
      <circle cx="43" cy="33" r="3" fill="var(--border-color)" />
      <circle cx="57" cy="33" r="3" fill="var(--border-color)" />
      <circle cx="38" cy="37" r="3.5" fill="#FFA4A4" opacity="0.9" />
      <circle cx="62" cy="37" r="3.5" fill="#FFA4A4" opacity="0.9" />
      <polygon points="48,37 52,37 50,40" fill="var(--border-color)" />
      <path d="M 47 43 Q 50 46 53 43" fill="none" stroke="var(--border-color)" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="44" cy="68" r="6" fill="#D4A373" stroke="var(--border-color)" strokeWidth="2.5" />
      <circle cx="56" cy="68" r="6" fill="#D4A373" stroke="var(--border-color)" strokeWidth="2.5" />
    </svg>
  );

  // --- Scale Dog SVGs ---
  // --- Scale Dog SVGs ---
  const renderWhiteDog = (isWinning, isLeft, isLosing) => (
    <g style={{ transition: 'transform 0.3s ease' }}>
      {/* Tiny hands/paws & body holding rope (rendered behind head) */}
      {isLeft === true && (
        <g>
          {/* Dust clouds under feet */}
          <ellipse cx="2" cy="42" rx="4" ry="2" fill="#E2E8F0" stroke="#000" strokeWidth="1" opacity="0.8" />
          <ellipse cx="10" cy="43" rx="4" ry="2" fill="#E2E8F0" stroke="#000" strokeWidth="1" opacity="0.8" />
          {/* Tail */}
          <path d="M 6 35 Q 0 32 3 27" fill="none" stroke="var(--border-color)" strokeWidth="2.5" strokeLinecap="round" />
          {/* Left leg (back) */}
          <ellipse cx="6" cy="41" rx="5" ry="4" fill="#FFFFFF" stroke="var(--border-color)" strokeWidth="2" />
          {/* Right leg (front) */}
          <ellipse cx="14" cy="42" rx="5" ry="4" fill="#FFFFFF" stroke="var(--border-color)" strokeWidth="2" />
          {/* Torso leaning back */}
          <ellipse cx="13" cy="33" rx="8" ry="10" fill="#FFFFFF" stroke="var(--border-color)" strokeWidth="2.5" transform="rotate(-15, 13, 33)" />
          {/* Red collar */}
          <path d="M 9 24 Q 14 28 17 25" fill="none" stroke="#FF5E7E" strokeWidth="3" strokeLinecap="round" />
          {/* Arms pulling rope */}
          <path d="M 15 31 Q 22 28 26 28" fill="none" stroke="var(--border-color)" strokeWidth="4.2" strokeLinecap="round" />
          <path d="M 15 31 Q 24 29 32 28" fill="none" stroke="var(--border-color)" strokeWidth="4.2" strokeLinecap="round" />
          
          {/* Hand 1 (Left hand) - 3 fingers wrapping rope */}
          <rect x="23" y="20.5" width="2.8" height="10" rx="1.4" fill="#FFFFFF" stroke="#000" strokeWidth="1.2" />
          <rect x="25.8" y="20.5" width="2.8" height="10" rx="1.4" fill="#FFFFFF" stroke="#000" strokeWidth="1.2" />
          <rect x="28.6" y="20.5" width="2.8" height="10" rx="1.4" fill="#FFFFFF" stroke="#000" strokeWidth="1.2" />

          {/* Hand 2 (Right hand) - 3 fingers wrapping rope */}
          <rect x="31.4" y="20.5" width="2.8" height="10" rx="1.4" fill="#FFFFFF" stroke="#000" strokeWidth="1.2" />
          <rect x="34.2" y="20.5" width="2.8" height="10" rx="1.4" fill="#FFFFFF" stroke="#000" strokeWidth="1.2" />
          <rect x="37" y="20.5" width="2.8" height="10" rx="1.4" fill="#FFFFFF" stroke="#000" strokeWidth="1.2" />
        </g>
      )}
      {isLeft === false && (
        <g>
          {/* Dust clouds under feet */}
          <ellipse cx="38" cy="42" rx="4" ry="2" fill="#E2E8F0" stroke="#000" strokeWidth="1" opacity="0.8" />
          <ellipse cx="30" cy="43" rx="4" ry="2" fill="#E2E8F0" stroke="#000" strokeWidth="1" opacity="0.8" />
          {/* Tail */}
          <path d="M 34 35 Q 40 32 37 27" fill="none" stroke="var(--border-color)" strokeWidth="2.5" strokeLinecap="round" />
          {/* Right leg (back) */}
          <ellipse cx="34" cy="41" rx="5" ry="4" fill="#FFFFFF" stroke="var(--border-color)" strokeWidth="2" />
          {/* Left leg (front) */}
          <ellipse cx="26" cy="42" rx="5" ry="4" fill="#FFFFFF" stroke="var(--border-color)" strokeWidth="2" />
          {/* Torso leaning back */}
          <ellipse cx="27" cy="33" rx="8" ry="10" fill="#FFFFFF" stroke="var(--border-color)" strokeWidth="2.5" transform="rotate(15, 27, 33)" />
          {/* Blue collar */}
          <path d="M 31 24 Q 26 28 23 25" fill="none" stroke="#3399FF" strokeWidth="3" strokeLinecap="round" />
          {/* Arms pulling rope */}
          <path d="M 25 31 Q 18 28 14 28" fill="none" stroke="var(--border-color)" strokeWidth="4.2" strokeLinecap="round" />
          <path d="M 25 31 Q 16 29 8 28" fill="none" stroke="var(--border-color)" strokeWidth="4.2" strokeLinecap="round" />
          
          {/* Hand 1 (Right hand) - 3 fingers wrapping rope */}
          <rect x="14" y="20.5" width="2.8" height="10" rx="1.4" fill="#FFFFFF" stroke="#000" strokeWidth="1.2" />
          <rect x="11.2" y="20.5" width="2.8" height="10" rx="1.4" fill="#FFFFFF" stroke="#000" strokeWidth="1.2" />
          <rect x="8.4" y="20.5" width="2.8" height="10" rx="1.4" fill="#FFFFFF" stroke="#000" strokeWidth="1.2" />

          {/* Hand 2 (Left hand) - 3 fingers wrapping rope */}
          <rect x="5.6" y="20.5" width="2.8" height="10" rx="1.4" fill="#FFFFFF" stroke="#000" strokeWidth="1.2" />
          <rect x="2.8" y="20.5" width="2.8" height="10" rx="1.4" fill="#FFFFFF" stroke="#000" strokeWidth="1.2" />
          <rect x="0" y="20.5" width="2.8" height="10" rx="1.4" fill="#FFFFFF" stroke="#000" strokeWidth="1.2" />
        </g>
      )}

      {/* Head details */}
      <ellipse cx="6" cy="15" rx="4" ry="7" fill="#FFFFFF" stroke="var(--border-color)" strokeWidth="2.5" />
      <ellipse cx="34" cy="15" rx="4" ry="7" fill="#FFFFFF" stroke="var(--border-color)" strokeWidth="2.5" />
      <ellipse cx="20" cy="22" rx="14" ry="12" fill="#FFFFFF" stroke="var(--border-color)" strokeWidth="2.5" />

      {/* Expressions: Normal vs Losing */}
      {isLosing ? (
        <g>
          {/* Dizzy Cross Eyes */}
          <path d="M 12 18 L 16 22 M 16 18 L 12 22" stroke="var(--border-color)" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M 24 18 L 28 22 M 28 18 L 24 22" stroke="var(--border-color)" strokeWidth="1.8" strokeLinecap="round" />
          {/* Wavy mouth */}
          <path d="M16 29 Q 18 27 20 29 Q 22 31 24 29" fill="none" stroke="var(--border-color)" strokeWidth="1.8" strokeLinecap="round" />
        </g>
      ) : (
        <g>
          {/* Normal eyes */}
          <circle cx="15" cy="20" r="2" fill="var(--border-color)" />
          <circle cx="25" cy="20" r="2" fill="var(--border-color)" />
          {/* Normal mouth */}
          <path d="M 18 27 Q 20 29 22 27" fill="none" stroke="var(--border-color)" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      )}

      <circle cx="10" cy="24" r="3.5" fill="#FFB7B2" opacity="0.9" />
      <circle cx="30" cy="24" r="3.5" fill="#FFB7B2" opacity="0.9" />
      <polygon points="18,23 22,23 20,25" fill="var(--border-color)" />

      {isWinning && (
        <g transform="translate(10, -14)" className="animate-float">
          <path d="M10 3.22C10 3.22 9.1-1 4.5-1-1.3-1-1.3 5.4 4.5 9 10.3 12.6 10 13.5 10 13.5s-.3-.9 5.5-4.5c5.8-3.6 5.8-10 0-10C10.9-1 10 3.22 10 3.22z" fill="#FF8A8A" stroke="var(--border-color)" strokeWidth="1.5" strokeLinejoin="round" />
        </g>
      )}
    </g>
  );

  const renderBrownDog = (isWinning, isLeft, isLosing) => (
    <g style={{ transition: 'transform 0.3s ease' }}>
      {/* Tiny hands/paws & body holding rope (rendered behind head) */}
      {isLeft === true && (
        <g>
          {/* Dust clouds under feet */}
          <ellipse cx="2" cy="42" rx="4" ry="2" fill="#E2E8F0" stroke="#000" strokeWidth="1" opacity="0.8" />
          <ellipse cx="10" cy="43" rx="4" ry="2" fill="#E2E8F0" stroke="#000" strokeWidth="1" opacity="0.8" />
          {/* Tail */}
          <path d="M 6 35 Q 0 32 3 27" fill="none" stroke="var(--border-color)" strokeWidth="2.5" strokeLinecap="round" />
          {/* Left leg (back) */}
          <ellipse cx="6" cy="41" rx="5" ry="4" fill="#D4A373" stroke="var(--border-color)" strokeWidth="2" />
          {/* Right leg (front) */}
          <ellipse cx="14" cy="42" rx="5" ry="4" fill="#D4A373" stroke="var(--border-color)" strokeWidth="2" />
          {/* Torso leaning back */}
          <ellipse cx="13" cy="33" rx="8" ry="10" fill="#D4A373" stroke="var(--border-color)" strokeWidth="2.5" transform="rotate(-15, 13, 33)" />
          {/* Red collar */}
          <path d="M 9 24 Q 14 28 17 25" fill="none" stroke="#FF5E7E" strokeWidth="3" strokeLinecap="round" />
          {/* Arms pulling rope */}
          <path d="M 15 31 Q 22 28 26 28" fill="none" stroke="var(--border-color)" strokeWidth="4.2" strokeLinecap="round" />
          <path d="M 15 31 Q 24 29 32 28" fill="none" stroke="var(--border-color)" strokeWidth="4.2" strokeLinecap="round" />
          
          {/* Hand 1 (Left hand) - 3 fingers wrapping rope */}
          <rect x="23" y="20.5" width="2.8" height="10" rx="1.4" fill="#D4A373" stroke="#000" strokeWidth="1.2" />
          <rect x="25.8" y="20.5" width="2.8" height="10" rx="1.4" fill="#D4A373" stroke="#000" strokeWidth="1.2" />
          <rect x="28.6" y="20.5" width="2.8" height="10" rx="1.4" fill="#D4A373" stroke="#000" strokeWidth="1.2" />

          {/* Hand 2 (Right hand) - 3 fingers wrapping rope */}
          <rect x="31.4" y="20.5" width="2.8" height="10" rx="1.4" fill="#D4A373" stroke="#000" strokeWidth="1.2" />
          <rect x="34.2" y="20.5" width="2.8" height="10" rx="1.4" fill="#D4A373" stroke="#000" strokeWidth="1.2" />
          <rect x="37" y="20.5" width="2.8" height="10" rx="1.4" fill="#D4A373" stroke="#000" strokeWidth="1.2" />
        </g>
      )}
      {isLeft === false && (
        <g>
          {/* Dust clouds under feet */}
          <ellipse cx="38" cy="42" rx="4" ry="2" fill="#E2E8F0" stroke="#000" strokeWidth="1" opacity="0.8" />
          <ellipse cx="30" cy="43" rx="4" ry="2" fill="#E2E8F0" stroke="#000" strokeWidth="1" opacity="0.8" />
          {/* Tail */}
          <path d="M 34 35 Q 40 32 37 27" fill="none" stroke="var(--border-color)" strokeWidth="2.5" strokeLinecap="round" />
          {/* Right leg (back) */}
          <ellipse cx="34" cy="41" rx="5" ry="4" fill="#D4A373" stroke="var(--border-color)" strokeWidth="2" />
          {/* Left leg (front) */}
          <ellipse cx="26" cy="42" rx="5" ry="4" fill="#D4A373" stroke="var(--border-color)" strokeWidth="2" />
          {/* Torso leaning back */}
          <ellipse cx="27" cy="33" rx="8" ry="10" fill="#D4A373" stroke="var(--border-color)" strokeWidth="2.5" transform="rotate(15, 27, 33)" />
          {/* Blue collar */}
          <path d="M 31 24 Q 26 28 23 25" fill="none" stroke="#3399FF" strokeWidth="3" strokeLinecap="round" />
          {/* Arms pulling rope */}
          <path d="M 25 31 Q 18 28 14 28" fill="none" stroke="var(--border-color)" strokeWidth="4.2" strokeLinecap="round" />
          <path d="M 25 31 Q 16 29 8 28" fill="none" stroke="var(--border-color)" strokeWidth="4.2" strokeLinecap="round" />
          
          {/* Hand 1 (Right hand) - 3 fingers wrapping rope */}
          <rect x="14" y="20.5" width="2.8" height="10" rx="1.4" fill="#D4A373" stroke="#000" strokeWidth="1.2" />
          <rect x="11.2" y="20.5" width="2.8" height="10" rx="1.4" fill="#D4A373" stroke="#000" strokeWidth="1.2" />
          <rect x="8.4" y="20.5" width="2.8" height="10" rx="1.4" fill="#D4A373" stroke="#000" strokeWidth="1.2" />

          {/* Hand 2 (Left hand) - 3 fingers wrapping rope */}
          <rect x="5.6" y="20.5" width="2.8" height="10" rx="1.4" fill="#D4A373" stroke="#000" strokeWidth="1.2" />
          <rect x="2.8" y="20.5" width="2.8" height="10" rx="1.4" fill="#D4A373" stroke="#000" strokeWidth="1.2" />
          <rect x="0" y="20.5" width="2.8" height="10" rx="1.4" fill="#D4A373" stroke="#000" strokeWidth="1.2" />
        </g>
      )}

      {/* Head details */}
      <ellipse cx="6" cy="15" rx="4" ry="7" fill="#D4A373" stroke="var(--border-color)" strokeWidth="2.5" />
      <ellipse cx="34" cy="15" rx="4" ry="7" fill="#D4A373" stroke="var(--border-color)" strokeWidth="2.5" />
      <ellipse cx="20" cy="22" rx="14" ry="12" fill="#D4A373" stroke="var(--border-color)" strokeWidth="2.5" />

      {/* Expressions: Normal vs Losing */}
      {isLosing ? (
        <g>
          {/* Dizzy Cross Eyes */}
          <path d="M 12 18 L 16 22 M 16 18 L 12 22" stroke="var(--border-color)" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M 24 18 L 28 22 M 28 18 L 24 22" stroke="var(--border-color)" strokeWidth="1.8" strokeLinecap="round" />
          {/* Wavy mouth */}
          <path d="M16 29 Q 18 27 20 29 Q 22 31 24 29" fill="none" stroke="var(--border-color)" strokeWidth="1.8" strokeLinecap="round" />
        </g>
      ) : (
        <g>
          {/* Normal eyes */}
          <circle cx="15" cy="20" r="2" fill="var(--border-color)" />
          <circle cx="25" cy="20" r="2" fill="var(--border-color)" />
          {/* Normal mouth */}
          <path d="M 18 27 Q 20 29 22 27" fill="none" stroke="var(--border-color)" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      )}

      <circle cx="10" cy="24" r="3.5" fill="#FFA4A4" opacity="0.9" />
      <circle cx="30" cy="24" r="3.5" fill="#FFA4A4" opacity="0.9" />
      <polygon points="18,23 22,23 20,25" fill="var(--border-color)" />

      {isWinning && (
        <g transform="translate(10, -14)" className="animate-float">
          <path d="M10 3.22C10 3.22 9.1-1 4.5-1-1.3-1-1.3 5.4 4.5 9 10.3 12.6 10 13.5 10 13.5s-.3-.9 5.5-4.5c5.8-3.6 5.8-10 0-10C10.9-1 10 3.22 10 3.22z" fill="#FFC857" stroke="var(--border-color)" strokeWidth="1.5" strokeLinejoin="round" />
        </g>
      )}
    </g>
  );

  const renderSpeechBubble = (x, y, text, isLeft) => (
    <g transform={`translate(${x}, ${y})`}>
      <g className="animate-pop" style={{ pointerEvents: 'none' }}>
        <path 
          d={isLeft 
            ? "M 10 0 L 90 0 A 8 8 0 0 1 98 8 L 98 22 A 8 8 0 0 1 90 30 L 50 30 L 40 38 L 40 30 L 10 30 A 8 8 0 0 1 2 22 L 2 8 A 8 8 0 0 1 10 0 Z" 
            : "M 10 0 L 90 0 A 8 8 0 0 1 98 8 L 98 22 A 8 8 0 0 1 90 30 L 60 30 L 60 38 L 50 30 L 10 30 A 8 8 0 0 1 2 22 L 2 8 A 8 8 0 0 1 10 0 Z"
          }
          fill="#FFFFFF" 
          stroke="var(--border-color)" 
          strokeWidth="2.2" 
          filter="drop-shadow(2px 2px 0px var(--shadow-color))"
        />
        <text 
          x="50" 
          y="19" 
          textAnchor="middle" 
          fontSize="9.5" 
          fontWeight="850" 
          fill="var(--text-primary)"
        >
          {text}
        </text>
      </g>
    </g>
  );

  // --- TUG OF WAR SVG ---
  const renderTugOfWar = () => {
    let shift = 0;
    const maxShift = 70;
    if (totalDiff !== 0) {
      const scaleMax = 5000 * rate;
      const percent = Math.min(1, Math.max(-1, totalDiff / scaleMax));
      shift = percent * maxShift;
    }

    const ropeY = 54;
    const ropeLeft = 50;
    const ropeRight = 270;
    const heartX = 160 - shift;

    // Dog positions
    const p1X = 30 - shift * 0.25;
    const p2X = 250 - shift * 0.25;

    // Posture rotation
    const p1Rotation = shift > 10 ? -12 : (shift < -10 ? 12 : 0);
    const p2Rotation = shift < -10 ? 12 : (shift > 10 ? -12 : 0);

    const p1Winning = shift > 5;
    const p2Winning = shift < -5;

    const renderSweat = (x, y) => (
      <g transform={`translate(${x}, ${y})`}>
        <path d="M0,0 Q3,-3 0,-8 Q-3,-3 0,0" fill="#70D6FF" stroke="#000" strokeWidth="1.2" />
        <path d="M6,4 Q9,1 6,-4 Q3,1 6,4" fill="#70D6FF" stroke="#000" strokeWidth="1.2" />
      </g>
    );

    return (
      <div className="WinnerDashboard-tugOfWarContainer" style={{
        backgroundColor: '#FFFDF9',
        border: '2.5px solid #000',
        borderRadius: '16px',
        padding: '12px 10px 8px 10px',
        marginBottom: '14px',
        boxShadow: 'var(--shadow-xs)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%'
      }}>
        <div style={{
          fontSize: '0.8rem',
          fontWeight: '900',
          color: 'var(--text-muted)',
          marginBottom: '4px',
          letterSpacing: '0.5px',
          textAlign: 'center'
        }}>
          🐶 雙方生活總付出 —— 拔河大對決 🐾
        </div>
        
        <svg viewBox="0 0 320 90" style={{ width: '100%', height: '100%', maxWidth: '340px' }}>
          {/* Dotted Center Reference Line */}
          <line x1="160" y1="15" x2="160" y2="85" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="3,3" />
          <text x="160" y="12" textAnchor="middle" fontSize="7.5" fontWeight="900" fill="#A0AEC0">平衡點</text>

          {/* Render Referee in background */}
          {(() => {
            const rx = 160;
            const ry = 30;
            const isP1Win = shift > 10;
            const isP2Win = shift < -10;
            return (
              <g>
                {/* Referee Body/Shirt (Black/White stripes) */}
                <path d={`M ${rx-7} ${ry+10} L ${rx+7} ${ry+10} L ${rx+5} ${ry+22} L ${rx-5} ${ry+22} Z`} fill="#000000" stroke="#000" strokeWidth="1.5" />
                <line x1={rx-3} y1={ry+10} x2={rx-3} y2={ry+22} stroke="#FFFFFF" strokeWidth="1.2" />
                <line x1={rx} y1={ry+10} x2={rx} y2={ry+22} stroke="#FFFFFF" strokeWidth="1.2" />
                <line x1={rx+3} y1={ry+10} x2={rx+3} y2={ry+22} stroke="#FFFFFF" strokeWidth="1.2" />

                {/* Head (Cute yellow chick referee) */}
                <circle cx={rx} cy={ry} r="9" fill="#FFE066" stroke="#000" strokeWidth="1.8" />
                <polygon points={`${rx-2.5},${ry+1} ${rx+2.5},${ry+1} ${rx},${ry+4.5}`} fill="#FF9233" stroke="#000" strokeWidth="1" />
                <circle cx={rx-3} cy={ry-2} r="1.1" fill="#000" />
                <circle cx={rx+3} cy={ry-2} r="1.1" fill="#000" />
                <circle cx={rx-5} cy={ry+1.5} r="1.2" fill="#FFB7B2" opacity="0.8" />
                <circle cx={rx+5} cy={ry+1.5} r="1.2" fill="#FFB7B2" opacity="0.8" />

                {/* Whistle */}
                <path d={`M ${rx} ${ry+2} L ${rx-1.5} ${ry+6} L ${rx-4} ${ry+6}`} fill="none" stroke="#000" strokeWidth="1" strokeLinecap="round" />
                <circle cx={rx-4.5} cy={ry+6} r="1.2" fill="#C0C0C0" stroke="#000" strokeWidth="0.8" />
                
                {/* Whistle sound text "嗶" when balanced */}
                {!isP1Win && !isP2Win && (
                  <g className="animate-float">
                    <text x={rx-18} y={ry+2} fontSize="6" fontWeight="950" fill="#FF3366">嗶！</text>
                  </g>
                )}

                {/* Point left flag */}
                {isP1Win && (
                  <g>
                    <path d={`M ${rx-5} ${ry+12} Q ${rx-12} ${ry+8} ${rx-15} ${ry+13}`} fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" />
                    <polygon points={`${rx-15},${ry+13} ${rx-21},${ry+8} ${rx-18},${ry+5}`} fill="#FF3366" stroke="#000" strokeWidth="1" />
                    <line x1={rx-15} y1={ry+13} x2={rx-18} y2={ry+5} stroke="#000" strokeWidth="1" />
                  </g>
                )}

                {/* Point right flag */}
                {isP2Win && (
                  <g>
                    <path d={`M ${rx+5} ${ry+12} Q ${rx+12} ${ry+8} ${rx+15} ${ry+13}`} fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" />
                    <polygon points={`${rx+15},${ry+13} ${rx+21},${ry+8} ${rx+18},${ry+5}`} fill="#3399FF" stroke="#000" strokeWidth="1" />
                    <line x1={rx+15} y1={ry+13} x2={rx+18} y2={ry+5} stroke="#000" strokeWidth="1" />
                  </g>
                )}

                {/* Hands up when balanced */}
                {!isP1Win && !isP2Win && (
                  <g>
                    <path d={`M ${rx-5} ${ry+12} Q ${rx-10} ${ry+5} ${rx-10} ${ry-1}`} fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" />
                    <path d={`M ${rx+5} ${ry+12} Q ${rx+10} ${ry+5} ${rx+10} ${ry-1}`} fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" />
                  </g>
                )}
              </g>
            );
          })()}

          {/* Tug rope (Twisted hemp rope effect) */}
          <line x1={ropeLeft} y1={ropeY} x2={ropeRight} y2={ropeY} stroke="#7F5539" strokeWidth="5.5" strokeLinecap="round" />
          <line x1={ropeLeft} y1={ropeY} x2={ropeRight} y2={ropeY} stroke="#E6CCB2" strokeWidth="2" strokeDasharray="5,5" strokeLinecap="round" />
          <line x1={ropeLeft + 35} y1={ropeY - 2.5} x2={ropeLeft + 35} y2={ropeY + 2.5} stroke="#000" strokeWidth="2.5" />
          <line x1={ropeRight - 35} y1={ropeY - 2.5} x2={ropeRight - 35} y2={ropeY + 2.5} stroke="#000" strokeWidth="2.5" />

          {/* Left Dog */}
          <g transform={`translate(${p1X}, ${ropeY - 26}) rotate(${p1Rotation}, 20, 20)`} style={{ transition: 'transform 0.4s ease' }}>
            {p1Role === 'white_dog' ? renderWhiteDog(p1Winning, true, p2Winning) : renderBrownDog(p1Winning, true, p2Winning)}
            {p2Winning && renderSweat(32, -4)}
          </g>

          {/* Right Dog */}
          <g transform={`translate(${p2X}, ${ropeY - 26}) rotate(${p2Rotation}, 20, 20)`} style={{ transition: 'transform 0.4s ease' }}>
            {p2Role === 'white_dog' ? renderWhiteDog(p2Winning, false, p1Winning) : renderBrownDog(p2Winning, false, p1Winning)}
            {p1Winning && renderSweat(-8, -4)}
          </g>

          {/* Center Tied Ribbon Flag & Heart */}
          <g transform={`translate(${heartX}, ${ropeY})`} style={{ transition: 'transform 0.4s ease' }}>
            {/* Tied Red Ribbon Tape hanging from rope */}
            <path d="M-2,0 L2,0 L4,13 L0,11 L-4,13 Z" fill="#FF3366" stroke="#000" strokeWidth="1.5" />
            <circle cx="0" cy="0" r="3" fill="none" stroke="#000" strokeWidth="2" />
            
            {/* Floating Heart above rope */}
            <g transform="translate(-10, -22)" className="animate-float">
              <path 
                d="M10 3.22C10 3.22 9.1-1 4.5-1-1.3-1-1.3 5.4 4.5 9 10.3 12.6 10 13.5 10 13.5s-.3-.9 5.5-4.5c5.8-3.6 5.8-10 0-10C10.9-1 10 3.22 10 3.22z" 
                fill="#FF3366" 
                stroke="#000" 
                strokeWidth="1.8" 
                strokeLinejoin="round" 
              />
              {shift > 10 && (
                <text x="-6" y="8" fontSize="7.5" fontWeight="950" fill="#FF3366">◀</text>
              )}
              {shift < -10 && (
                <text x="22" y="8" fontSize="7.5" fontWeight="950" fill="#FF3366">▶</text>
              )}
            </g>
          </g>
        </svg>

        <div style={{
          fontSize: '0.75rem',
          fontWeight: '850',
          marginTop: '4px',
          color: totalDiff === 0 ? 'green' : '#C53030',
          textAlign: 'center'
        }}>
          {totalDiff === 0 ? (
            <span>🥳 完美對等！雙方正在甜美平衡中拉扯！</span>
          ) : (
            <span>
              💪 <strong>{totalDiff > 0 ? p1Name : p2Name}</strong> 佔據上風，正把綜合付出拉向自己！
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {/* 1. Difference Analysis (Top, Full Width) */}
      {showSummary && (
        <div className="comic-card WinnerDashboard-summaryCard" style={styles.summaryCard}>
          <div className="WinnerDashboard-banner" style={styles.banner}>
            <span style={styles.bannerText}>⚖️ 雙方付出差額分析</span>
          </div>

          {renderTugOfWar()}

          <div className="WinnerDashboard-summaryBodyGrid" style={styles.summaryBodyGrid}>
            {/* Card 1: Money Difference */}
            <div className="comic-card WinnerDashboard-miniCard" style={styles.miniCard}>
              <span className="WinnerDashboard-miniLabel" style={styles.miniLabel}>💰 共同生活金錢差額</span>
              <div style={styles.miniValue}>
                {moneyDiff === 0 ? (
                  <span style={styles.miniBalanced}>完美平衡</span>
                ) : (
                  <div style={styles.miniImbalanced}>
                    <span style={styles.miniName}>{moneyDiff > 0 ? p1Name : p2Name} 多支出</span>
                    <span style={styles.miniAmount}>{symbol} {Math.abs(moneyDiff).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Card 2: Chores Difference */}
            <div className="comic-card WinnerDashboard-miniCard" style={styles.miniCard}>
              <span className="WinnerDashboard-miniLabel" style={styles.miniLabel}>🧹 家事勞動差額</span>
              <div style={styles.miniValue}>
                {loveDiff === 0 ? (
                  <span style={styles.miniBalanced}>完美平衡</span>
                ) : (
                  <div style={styles.miniImbalanced}>
                    <span style={styles.miniName}>{loveDiff > 0 ? p1Name : p2Name} 多付出</span>
                    <span style={styles.miniAmount}>{Math.abs(loveDiff)} 點</span>
                    <span style={styles.miniSubValue}>折合 {symbol} {(Math.abs(loveDiff) * lovePointRate).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Card 3: Combined Net Contribution */}
            <div className="comic-card WinnerDashboard-miniCard" style={{ ...styles.miniCard, backgroundColor: '#FFEBEF', borderColor: '#FF5E7E' }}>
              <span className="WinnerDashboard-miniLabel" style={{ ...styles.miniLabel, color: '#B91C1C' }}>⚖️ 雙方生活總貢獻差額</span>
              <div style={styles.miniValue}>
                {totalDiff === 0 ? (
                  <span style={{ ...styles.miniBalanced, backgroundColor: '#FF5E7E', color: '#fff' }}>完美平衡</span>
                ) : (
                  <div style={styles.miniImbalanced}>
                    <span style={{ ...styles.miniName, color: '#B91C1C' }}>{totalDiff > 0 ? p1Name : p2Name} 總貢獻高出</span>
                    <span style={{ ...styles.miniAmount, color: '#D01C4C' }}>{symbol} {Math.abs(totalDiff).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    <span style={{ fontSize: '0.64rem', color: '#666', fontWeight: '750', marginTop: '2px' }}>
                      (支出的金錢 + 家事折算)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showIndividualStats && (
        <div className="WinnerDashboard-columnsGrid" style={styles.columnsGrid}>
          {/* P1 Column Card */}
          <div 
            onClick={() => onPartnerClick && onPartnerClick('p1')}
            className="comic-card WinnerDashboard-statsCard" 
            style={{ ...styles.statsCard, cursor: onPartnerClick ? 'pointer' : 'default' }}
          >
            <div style={styles.cardHeader}>
              <div style={styles.avatarWrapper}>
                {p1Role === 'white_dog' ? renderWhiteDogBadge() : renderGrayDogBadge()}
              </div>
              <span style={styles.roleName}>{p1Name}</span>
            </div>
            <div style={styles.statsBody}>
              <div style={styles.statItem}>
                <span style={styles.statLabel}>金錢累計支出</span>
                <span style={styles.statValue}>{symbol} {p1Money.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 })}</span>
              </div>
              <div style={styles.statItem}>
                <span style={styles.statLabel}>家事勞動點數</span>
                <span style={styles.statValue}>{p1Love} 點 <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700' }}>({symbol} {(p1Love * lovePointRate).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 })})</span></span>
              </div>
              <div style={styles.statItem}>
                <span style={styles.statLabel}>綜合付出價值</span>
                <span style={{ ...styles.statValue, color: 'var(--color-money-accent-hover)' }}>{symbol} {p1Total.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 })}</span>
              </div>
            </div>
          </div>

          {/* P2 Column Card */}
          <div 
            onClick={() => onPartnerClick && onPartnerClick('p2')}
            className="comic-card WinnerDashboard-statsCard" 
            style={{ ...styles.statsCard, cursor: onPartnerClick ? 'pointer' : 'default' }}
          >
            <div style={styles.cardHeader}>
              <div style={styles.avatarWrapper}>
                {p2Role === 'white_dog' ? renderWhiteDogBadge() : renderGrayDogBadge()}
              </div>
              <span style={styles.roleName}>{p2Name}</span>
            </div>
            <div style={styles.statsBody}>
              <div style={styles.statItem}>
                <span style={styles.statLabel}>金錢累計支出</span>
                <span style={styles.statValue}>{symbol} {p2Money.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 })}</span>
              </div>
              <div style={styles.statItem}>
                <span style={styles.statLabel}>家事勞動點數</span>
                <span style={styles.statValue}>{p2Love} 點 <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700' }}>({symbol} {(p2Love * lovePointRate).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 })})</span></span>
              </div>
              <div style={styles.statItem}>
                <span style={styles.statLabel}>綜合付出價值</span>
                <span style={{ ...styles.statValue, color: 'var(--color-money-accent-hover)' }}>{symbol} {p2Total.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 })}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginBottom: '24px',
  },
  banner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--text-primary)',
    borderRadius: '10px',
    padding: '8px 16px',
    marginBottom: '16px',
    boxShadow: 'var(--shadow-xs)',
  },
  bannerText: {
    fontWeight: '900',
    fontSize: '0.95rem',
    letterSpacing: '1px',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  columnsGrid: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
  },
  statsCard: {
    flex: '1 1 240px',
    backgroundColor: '#FFFFFF',
    padding: '18px 22px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    transition: 'transform 0.22s var(--ease-snappy), box-shadow 0.22s var(--ease-snappy)',
  },
  summaryCard: {
    width: '100%',
    backgroundColor: 'var(--bg-secondary)',
    backgroundImage: 'linear-gradient(rgba(214, 154, 107, 0.12) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(214, 154, 107, 0.12) 1.5px, transparent 1.5px)',
    backgroundSize: '16px 16px',
    padding: '22px 26px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    transition: 'transform 0.22s var(--ease-snappy), box-shadow 0.22s var(--ease-snappy)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    borderBottom: 'var(--border-thick)',
    paddingBottom: '10px',
  },
  avatarWrapper: {
    width: '40px',
    height: '32px',
  },
  dogBadgeSvg: {
    width: '100%',
    height: '100%',
  },
  roleName: {
    fontWeight: '900',
    fontSize: '1rem',
    color: 'var(--text-primary)',
    letterSpacing: '0.5px',
  },
  statsBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  statLabel: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    fontWeight: '800',
  },
  statValue: {
    fontSize: '1.45rem',
    fontWeight: '950',
    color: 'var(--text-primary)',
    letterSpacing: '-0.5px',
  },
  summaryBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  summaryItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  balanceLabel: {
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
    fontWeight: '900',
    letterSpacing: '0.5px',
  },
  balanceValueContainer: {
    fontSize: '1.1rem',
    color: 'var(--text-primary)',
    fontWeight: '800',
  },
  balancedText: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: 'var(--text-primary)',
    color: '#FFFFFF',
    padding: '6px 12px',
    borderRadius: '10px',
    fontSize: '0.85rem',
    fontWeight: '900',
    border: '2.5px solid var(--border-color)',
    boxShadow: 'var(--shadow-xs)',
  },
  imbalancedText: {
    color: 'var(--text-primary)',
    fontWeight: '800',
  },
  highlight: {
    fontWeight: '950',
    color: 'var(--text-primary)',
    textDecoration: 'underline',
    fontSize: '1.25rem',
  },
  dividerLine: {
    height: '0px',
    borderTop: '2px dashed var(--border-color)',
    margin: '4px 0',
  },
  scaleCardContainer: {
    backgroundColor: '#FFFFFF',
    border: '2.5px solid var(--border-color)',
    borderRadius: '16px',
    padding: '12px 12px 6px 12px',
    marginBottom: '10px',
    boxShadow: 'var(--shadow-xs)',
  },
  scaleCardLabel: {
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: '4px',
    letterSpacing: '0.5px',
  },
  scaleContainer: {
    height: '170px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0',
  },
  scaleSvg: {
    width: '100%',
    height: '100%',
    maxHeight: '170px',
  },
  scaleTransition: {
    transition: 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
  summaryBodyGrid: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
    width: '100%',
  },
  miniCard: {
    flex: '1 1 200px',
    backgroundColor: '#FFFFFF',
    border: '2.5px solid #000',
    borderRadius: '12px',
    padding: '14px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    boxShadow: '2px 2px 0px #000',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  miniLabel: {
    fontSize: '0.78rem',
    color: '#666666',
    fontWeight: '900',
    letterSpacing: '0.5px',
  },
  miniValue: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    flex: 1,
  },
  miniBalanced: {
    display: 'inline-flex',
    alignSelf: 'flex-start',
    backgroundColor: '#000000',
    color: '#FFFFFF',
    padding: '3px 8px',
    borderRadius: '8px',
    fontSize: '0.75rem',
    fontWeight: '900',
  },
  miniImbalanced: {
    display: 'flex',
    flexDirection: 'column',
  },
  miniName: {
    fontSize: '0.8rem',
    fontWeight: '800',
    color: '#333333',
  },
  miniAmount: {
    fontSize: '1.35rem',
    fontWeight: '950',
    color: '#000000',
    lineHeight: '1.2',
    marginTop: '2px',
  },
  miniSubValue: {
    fontSize: '0.72rem',
    color: '#666666',
    fontWeight: '750',
    marginTop: '2px',
  }
};
