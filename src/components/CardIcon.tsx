import type { CardId } from '../types/game';

export function CardIcon({ cardId, className = 'w-8 h-8' }: { cardId: CardId; className?: string }) {
  switch (cardId) {
    case 'fast_bit':
      return (
        <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
          <circle cx="20" cy="20" r="17" fill="#083344" stroke="#22D3EE" strokeWidth="2" />
          <path
            d="M20 7 L31 28 L20 22 L9 28 Z"
            fill="#06B6D4"
            stroke="#E0F2FE"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <circle cx="20" cy="17" r="3" fill="#FDE047" />
        </svg>
      );
    case 'loop_knight':
      return (
        <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
          <circle cx="20" cy="20" r="17" fill="#172554" stroke="#60A5FA" strokeWidth="2" />
          <rect x="25" y="9" width="4" height="17" rx="1.5" fill="#E2E8F0" transform="rotate(24 27 17)" />
          <circle cx="19" cy="21" r="8.5" fill="#2563EB" stroke="#93C5FD" strokeWidth="2" />
          <path d="M12 16 A8 8 0 0 1 24 14" stroke="#F8FAFC" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <circle cx="13" cy="22" r="5" fill="#94A3B8" stroke="#E2E8F0" strokeWidth="1.5" />
        </svg>
      );
    case 'mainframe_golem':
      return (
        <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
          <circle cx="20" cy="20" r="17" fill="#2E1065" stroke="#A78BFA" strokeWidth="2" />
          <polygon
            points="20,7 29,12 31,22 25,31 15,31 9,22 11,12"
            fill="#4C1D95"
            stroke="#C4B5FD"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <circle cx="20" cy="20" r="5.5" fill="#38BDF8" />
          <circle cx="20" cy="20" r="2.2" fill="#F8FAFC" />
        </svg>
      );
    case 'debug_fireball':
      return (
        <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
          <circle cx="20" cy="20" r="17" fill="#431407" stroke="#FB923C" strokeWidth="2" />
          <path
            d="M21 7 C26 12 30 17 28 24 C27 29 22 32 18 32 C13 32 10 28 11 23 C12 19 15 16 14 12 C17 13 19 11 21 7 Z"
            fill="#F97316"
            stroke="#FED7AA"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <circle cx="20" cy="23" r="4.5" fill="#FDE047" />
        </svg>
      );
  }
}

export function ElixirDropIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 2.5 C12 2.5 5.5 10.2 5.5 14.8 C5.5 18.6 8.4 21.5 12 21.5 C15.6 21.5 18.5 18.6 18.5 14.8 C18.5 10.2 12 2.5 12 2.5 Z"
        fill="#D946EF"
        stroke="#FAE8FF"
        strokeWidth="1.5"
      />
      <path
        d="M9.2 14.8 C9.2 16.5 10.3 17.8 11.8 18.1"
        stroke="#FAE8FF"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function CrownIcon({
  color = '#FBBF24',
  className = 'w-4 h-4',
}: {
  color?: string;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M3 18 L4.5 7.5 L9.5 12 L12 5.5 L14.5 12 L19.5 7.5 L21 18 Z"
        fill={color}
        stroke="#0F172A"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <rect x="3.5" y="18" width="17" height="2.5" rx="1" fill={color} stroke="#0F172A" strokeWidth="1.2" />
    </svg>
  );
}
