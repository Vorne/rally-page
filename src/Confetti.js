/*global React */

import './confetti.css';

export default function Confetti({ onAnimationEnd }) {
    const [fadeOut, setFadeOut] = React.useState(false);

    React.useEffect(() => {
        if (fadeOut) {
            const timeoutId = setTimeout(() => {
                onAnimationEnd();
            }, 500);

            return () => {
                clearTimeout(timeoutId);
                onAnimationEnd();
            };
        }

        const timeoutId = setTimeout(() => {
            setFadeOut(true);
        }, 5e3);

        return () => {
            clearTimeout(timeoutId);
            setFadeOut(true);
        };
    }, [onAnimationEnd, fadeOut]);

    return (
        <div className={`confetti-stage ${fadeOut ? 'stage-fade-out' : 'stage-fade-in'}`}>
            <div className="confetti-field" aria-hidden="true">
                <i className="piece"></i>
                <i className="piece"></i>
                <i className="piece"></i>
                <i className="piece"></i>
                <i className="piece"></i>
                <i className="piece"></i>
                <i className="piece"></i>
                <i className="piece"></i>
                <i className="piece"></i>
                <i className="piece"></i>
                <i className="piece"></i>
                <i className="piece"></i>
                <i className="piece"></i>
                <i className="piece"></i>
                <i className="piece"></i>
                <i className="piece"></i>
                <i className="piece"></i>
                <i className="piece"></i>
                <i className="piece"></i>
                <i className="piece"></i>
                <i className="piece"></i>
                <i className="piece"></i>
                <i className="piece"></i>
                <i className="piece"></i>
                <i className="piece"></i>
                <i className="piece"></i>
                <i className="piece"></i>
                <i className="piece"></i>
                <i className="piece"></i>
                <i className="piece"></i>
                <i className="piece"></i>
                <i className="piece"></i>
                <i className="piece"></i>
                <i className="piece"></i>
                <i className="piece"></i>
                <i className="piece"></i>
                <i className="piece"></i>
                <i className="piece"></i>
                <i className="piece"></i>
                <i className="piece"></i>
                <i className="piece"></i>
                <i className="piece"></i>
                <i className="piece"></i>
                <i className="piece"></i>
                <i className="piece"></i>
                <i className="piece"></i>
                <i className="piece"></i>
                <i className="piece"></i>
                <i className="piece"></i>
                <i className="piece"></i>
                <i className="piece"></i>
                <i className="piece"></i>
                <i className="piece"></i>
                <i className="piece"></i>
                <i className="piece"></i>
                <i className="piece"></i>
                <i className="piece"></i>
                <i className="piece"></i>
                <i className="piece"></i>
            </div>
        </div>
    );
}
