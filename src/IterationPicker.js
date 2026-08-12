/*global React, moment */

function formatRange(iteration) {
    if (!iteration || !iteration.StartDate || !iteration.EndDate) {
        return '';
    }
    const start = moment(iteration.StartDate).format('M/D/YYYY');
    const end = moment(iteration.EndDate).format('M/D/YYYY');
    return `${start} – ${end}`;
}

export default function IterationPicker(props) {

    const {
        iterations,
        onChange,
        value,
    } = props;

    const [open, setOpen] = React.useState(false);
    const rootRef = React.useRef(null);

    React.useEffect(() => {
        if (!open) {
            return undefined;
        }

        const onMouseDown = (ev) => {
            if (rootRef.current && !rootRef.current.contains(ev.target)) {
                setOpen(false);
            }
        };
        const onKeyDown = (ev) => {
            if (ev.key === 'Escape') {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', onMouseDown);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('mousedown', onMouseDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [open]);

    if (!iterations || iterations.length === 0) {
        return null;
    }

    const index = iterations.findIndex((it) => it._ref === value);
    const selected = index >= 0 ? iterations[index] : null;

    // newest first, so a higher index is further back in time
    const olderDisabled = index < 0 || index >= iterations.length - 1;
    const newerDisabled = index <= 0;

    const step = (delta, disabled) => {
        if (disabled) {
            return;
        }
        onChange(iterations[index + delta]._ref);
    };

    const pick = (iteration) => {
        onChange(iteration._ref);
        setOpen(false);
    };

    const renderList = () => {
        if (!open) {
            return null;
        }
        return (
            <div className="timebox-list">
                {iterations.map((it) => {
                    const cls = it._ref === value ? 'timebox-item selected' : 'timebox-item';
                    return (
                        <div className={cls} key={it._ref} onClick={() => pick(it)}>
                            <div className="timebox-name">{it.Name}</div>
                            <div className="timebox-dates">{formatRange(it)}</div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="iteration-combobox" ref={rootRef}>
            <div
                className={olderDisabled ? 'combobox-arrow disabled' : 'combobox-arrow'}
                title="Previous iteration"
                onClick={() => step(1, olderDisabled)}
            >
                &#8249;
            </div>
            <div className="combobox-field" onClick={() => setOpen(!open)}>
                <span className="combobox-name">{selected ? selected.Name : 'Select an iteration'}</span>
                <span className="timebox-dates">{formatRange(selected)}</span>
                <span className="combobox-trigger">&#9662;</span>
            </div>
            <div
                className={newerDisabled ? 'combobox-arrow disabled' : 'combobox-arrow'}
                title="Next iteration"
                onClick={() => step(-1, newerDisabled)}
            >
                &#8250;
            </div>
            {renderList()}
        </div>
    );
}
