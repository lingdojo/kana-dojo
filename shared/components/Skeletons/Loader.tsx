'use client';
import { useState, useEffect } from 'react';
import BarLoader from 'react-spinners/BarLoader';

const Loader = () => {
  const [loaderColor, setLoaderColor] = useState('#f1f7fb');

  useEffect(() => {
    // Ensure this runs only in a browser (not SSR)
    if (typeof window !== 'undefined') {
      const color = getComputedStyle(document.documentElement)
        .getPropertyValue('--main-color')
        .trim();

      if (color) {
        setLoaderColor(color);
      }
    }
  }, []); // Runs once when component mounts (client-side)

  return (
    <div className='fixed inset-0 flex flex-col gap-1 items-center justify-center'>
      <BarLoader
        width={200}
        color={loaderColor}
        loading={true}
        speedMultiplier={1.5}
      />
    </div>
  );
};

export default Loader;
