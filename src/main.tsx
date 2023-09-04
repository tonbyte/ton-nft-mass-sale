import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './app';

const root = document.getElementById('root') as HTMLElement;

ReactDOM.render(
    <React.StrictMode>
        <React.Suspense fallback="">
            <App />
        </React.Suspense>
    </React.StrictMode>, 
    root);
    