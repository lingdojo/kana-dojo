// Declaraciones de tipo para importaciones de CSS y otros módulos
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '@fortawesome/fontawesome-svg-core/styles.css';

// Add JSX namespace declaration for ruby element
declare namespace JSX {
  interface IntrinsicElements {
    ruby: React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    >;
    rt: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  }
}
