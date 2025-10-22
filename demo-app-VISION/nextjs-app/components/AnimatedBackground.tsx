'use client'

export default function AnimatedBackground({ darkMode }: { darkMode: boolean }) {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: -1 }}>
      <div className={`absolute inset-0 ${
        darkMode 
          ? 'bg-slate-800'
          : 'bg-blue-50'
      }`}>
        {/* Animated blobs with glow effect - SUPER VISIBLE FOR TESTING */}
        <div className={`absolute top-20 left-20 w-[500px] h-[500px] ${
          darkMode ? 'bg-blue-500' : 'bg-purple-500'
        } rounded-full blur-3xl animate-blob opacity-70`}></div>
        
        <div className={`absolute top-20 right-20 w-[500px] h-[500px] ${
          darkMode ? 'bg-purple-500' : 'bg-yellow-500'
        } rounded-full blur-3xl animate-blob animation-delay-2000 opacity-70`}></div>
        
        <div className={`absolute bottom-20 left-40 w-[500px] h-[500px] ${
          darkMode ? 'bg-pink-500' : 'bg-pink-500'
        } rounded-full blur-3xl animate-blob animation-delay-4000 opacity-70`}></div>
        
        <div className={`absolute bottom-20 right-40 w-[500px] h-[500px] ${
          darkMode ? 'bg-indigo-500' : 'bg-blue-500'
        } rounded-full blur-3xl animate-blob animation-delay-6000 opacity-70`}></div>
      </div>
    </div>
  )
}
