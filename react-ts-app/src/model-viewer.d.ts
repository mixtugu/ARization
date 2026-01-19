import React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        alt?: string;
        'camera-controls'?: boolean | string;
        'auto-rotate'?: boolean | string;
        style?: React.CSSProperties;
      };
    }
  }
}

export {};