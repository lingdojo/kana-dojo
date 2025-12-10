const Banner = () => {
  return (
    <h1 className='w-1/2 sm:w-2/3 md:pb-2 text-4xl font-bold flex flex-col items-start justify-center gap-1 lg:flex lg:flex-row lg:justify-start lg:items-center lg:gap-2'>
      <span lang='en'>KanaDojo</span>
      <span lang='ja' className='font-normal text-[var(--secondary-color)]'>
        かな道場
      </span>
    </h1>
  );
};

export default Banner;
