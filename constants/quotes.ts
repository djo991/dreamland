export const DREAM_QUOTES = [
  "Dreams are the touchstones of our characters. — Henry David Thoreau",
  "A dream you dream alone is only a dream. A dream you dream together is reality. — Yoko Ono",
  "The future belongs to those who believe in the beauty of their dreams. — Eleanor Roosevelt",
  "Dreams are illustrations... from the book your soul is writing about you. — Marsha Norman",
  "Throw your dreams into space like a kite, and you do not know what it will bring back, a new life, a new friend, a new love, a new country. — Anaïs Nin",
  "Sleep is the best meditation. — Dalai Lama",
  "Man is a genius when he is dreaming. — Akira Kurosawa",
  "Dreams are renewable. No matter what our age or condition, there are still untapped possibilities within us and new beauty waiting to be born. — Dale E. Turner"
];

export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
};