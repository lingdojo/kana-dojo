'use client';

const Loader = () => {
  return (
    <div className='fixed inset-0 flex flex-col items-center justify-center gap-1'>
      <div className='relative h-1 w-[200px] overflow-hidden rounded-full bg-(--card-color)'>
        <div className='absolute inset-0 animate-[loading_1.5s_ease-in-out_infinite] bg-(--main-color)' />
      </div>
      <style jsx>{`
        @keyframes loading {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </div>
  );
};

export default Loader;
