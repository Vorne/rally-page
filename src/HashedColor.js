/*global */

import {
    simpleHash,
} from './util.js';

export default function HashedColor(props) {

    const {
        text,
        lightness,
    } = props;

    let hsh = 0;
    if (text) {
        hsh = simpleHash(text + 'Summer') % 360;
    }
    if (text === 'api') {
        hsh = 90;
    }
    else if (text === 'web') {
        hsh = 210;
    }

    const _lightness = lightness || '20%';
    const style = {
        backgroundColor: `hsl(${hsh}, 100%, ${_lightness})`,
    };

    return (
        <span style={style} className="pill"> {text} </span>
    );
}
