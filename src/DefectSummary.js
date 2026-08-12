/*global React */

import ReleaseName from './ReleaseName.js';
import HashedColor from './HashedColor.js';

export default function DefectSummary(props) {

    const {
        records,
    } = props;

    const {
        defectSummary,
        labels,
        total,
    } = React.useMemo(() => {
        let _total = 0;
        let _labels = {};
        const rv = records.reduce((acc, rec) => {
            if (rec.isDefect()) {
                if (rec.data.ScheduleState !== 'Completed' && rec.data.ScheduleState !== 'Accepted') {
                    _total += 1;
                    const priority = rec.data.Priority === 'High' || rec.data.Priority === 'Critical' ? 'high' : 'low';
                    if (acc[priority][rec.data.Release?.Name]) {
                        acc[priority][rec.data.Release?.Name] += 1;
                    }
                    else {
                        acc[priority][rec.data.Release?.Name] = 1;
                    }

                    if (!_labels[rec.data.Release?.Name]) {
                        _labels[rec.data.Release?.Name] = <ReleaseName artifact={rec} />;
                    }
                }
            }
            return acc;
        }, { high: {}, low: {} });
        return {
            defectSummary: rv,
            total: _total,
            labels: _labels,
        };
    }, [records]);

    const renderTotal = () => {
        return (
            <div key="total" className="defect-total-container">
                <div> Total <HashedColor text="All" lightness='50%' /> </div>
                <div className="big-defect"> {total} </div>
            </div>
        );
    };

    const renderBucket = (pri) => {
        return Object.keys((defectSummary[pri])).sort().map((key) => {
            const value = defectSummary[pri][key];
            let pp = pri === 'high' ? 'High' : 'Low';
            return (
                <div key={key} className="defect-total-container">
                    <div>{pp} {labels[key]} </div>
                    <div className="big-defect"> {value} </div>
                </div>
            );
        });
    };

    const renderBuckets = () => {
        let rv = [];
        rv.push(renderTotal());
        rv.push(renderBucket('high'));
        rv.push(renderBucket('low'));
        return rv;
    };

    return (
        <div className="big-defect-parent" >
            {renderBuckets()}
        </div>
    );
}
