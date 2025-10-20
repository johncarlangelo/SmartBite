import { useEffect, useRef, FC } from 'react';
import { gsap } from 'gsap';

interface GridMotionProps {
  items?: string[];
  gradientColor?: string;
  opacity?: number;
  blur?: number;
}

const GridMotion: FC<GridMotionProps> = ({ items = [], gradientColor = 'black', opacity = 1, blur = 0 }) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  const totalItems = 28;
  const defaultItems = Array.from({ length: totalItems }, (_, index) => `Item ${index + 1}`);
  const combinedItems = items.length > 0 ? items.slice(0, totalItems) : defaultItems;

useEffect(() => {
  // Infinite slideshow animation for each row
  rowRefs.current.forEach((row, index) => {
    if (row) {
      const direction = index % 2 === 0 ? 1 : -1;
      const speedFactor = 0.2; // 
      const duration = (40 + index * 8) * speedFactor; // reduced a bit from (50 + 10)
      const distance = 500;

      // Create infinite sliding animation (back and forth)
      gsap.to(row, {
        x: direction * distance,
        duration: duration,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });

      // Add subtle vertical floating effect
      gsap.to(row, {
        y: Math.sin(index * 0.5) * 15,
        duration: 4 + index * 0.5,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });
    }
  });
}, []);
  useEffect(() => {

    return () => {
      // Clean up animations on unmount
      rowRefs.current.forEach((row) => {
        if (row) {
          gsap.killTweensOf(row);
        }
      });
    };
  }, []);

  return (
    <div ref={gridRef} className="h-full w-full overflow-hidden">
      <section
        className="w-full h-screen overflow-hidden relative flex items-center justify-center"
        style={{
          background: `radial-gradient(circle, ${gradientColor} 0%, transparent 100%)`,
          opacity: opacity,
          filter: `blur(${blur}px)`
        }}
      >
        <div className="absolute inset-0 pointer-events-none z-[4] bg-[length:250px]"></div>
        <div className="gap-4 flex-none relative w-[150vw] h-[150vh] grid grid-rows-4 grid-cols-1 rotate-[-15deg] origin-center z-[2]">
          {Array.from({ length: 4 }, (_, rowIndex) => (
            <div
              key={rowIndex}
              className="grid gap-4 grid-cols-7"
              style={{ willChange: 'transform, filter' }}
              ref={el => {
                if (el) rowRefs.current[rowIndex] = el;
              }}
            >
              {Array.from({ length: 7 }, (_, itemIndex) => {
                const content = combinedItems[rowIndex * 7 + itemIndex];
                return (
                  <div key={itemIndex} className="relative">
                    <div className="relative w-full h-full overflow-hidden rounded-[10px] bg-[#111] flex items-center justify-center text-white text-[1.5rem]">
                      {typeof content === 'string' && (content.startsWith('http') || content.startsWith('/')) ? (
                        <div
                          className="w-full h-full bg-cover bg-center absolute top-0 left-0"
                          style={{ backgroundImage: `url(${content})` }}
                        ></div>
                      ) : (
                        <div className="p-4 text-center z-[1]">{content}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="relative w-full h-full top-0 left-0 pointer-events-none"></div>
      </section>
    </div>
  );
};

export default GridMotion;
