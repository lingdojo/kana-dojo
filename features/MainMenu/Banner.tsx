const Banner = () => {
  return (
    <h1 className='flex w-1/2 flex-col items-start justify-center gap-1 text-4xl font-bold sm:w-2/3 md:pb-2 lg:flex lg:flex-row lg:items-center lg:justify-start lg:gap-2'>
      <span lang='en'>KanaDojo</span>
      <span lang='ja' className='font-normal text-(--secondary-color)'>
        かな道場
      </span>
    </h1>
  );
};

export default Banner;
