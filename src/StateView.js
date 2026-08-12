/*global React */

export default function StateView(props) {

    const {
        item,
        onSave,
    } = props;

    const save = React.useCallback(() => {
        item.save({
            callback: onSave,
        });
    }, [item, onSave]);

    const saveState = (ss) => {
        if (window.confirm(`Force state to "${ss}"?`)) {
            item.set('State', ss);
            save();
        }
    };

    const saveScheduleState = (ss) => {
        item.set('ScheduleState', ss);
        save();
    };

    if (item.isTask()) {
        if (item.data.State === 'Defined') {
            return (
                <div className="state-view-container">
                    <div className="box-letter yes"> D </div>
                    <div className="box-letter clickable" onClick={() => saveState('In-Progress')}> P </div>
                    <div className="box-letter clickable" onClick={() => saveState('Completed')}> C </div>
                </div>
            );
        }
        if (item.data.State === 'In-Progress') {
            return (
                <div className="state-view-container">
                    <div className="box-letter yes clickable" onClick={() => saveState('Defined')}> D </div>
                    <div className="box-letter yes"> P </div>
                    <div className="box-letter clickable" onClick={() => saveState('Completed')}> C </div>
                </div>
            );
        }
        if (item.data.State === 'Completed') {
            return (
                <div className="state-view-container">
                    <div className="box-letter yes clickable" onClick={() => saveState('Defined')}> D </div>
                    <div className="box-letter yes clickable" onClick={() => saveState('In-Progress')}> P </div>
                    <div className="box-letter yes"> C </div>
                </div>
            );
        }
        return (
            <div> {item.data.State} </div>
        );
    }
    if (item.data.ScheduleState === 'Defined') {
        return (
            <div className="state-view-container">
                <div className="box-letter yes"> D </div>
                <div className="box-letter clickable" onClick={() => saveScheduleState('In-Progress')}> P </div>
                <div className="box-letter clickable" onClick={() => saveScheduleState('Completed')}> C </div>
                <div className="box-letter"> A </div>
            </div>
        );
    }
    if (item.data.ScheduleState === 'In-Progress') {
        return (
            <div className="state-view-container">
                <div className="box-letter yes clickable" onClick={() => saveScheduleState('Defined')}> D </div>
                <div className="box-letter yes"> P </div>
                <div className="box-letter clickable" onClick={() => saveScheduleState('Completed')}> C </div>
                <div className="box-letter"> A </div>
            </div>
        );
    }
    if (item.data.ScheduleState === 'Completed') {
        return (
            <div className="state-view-container">
                <div className="box-letter yes clickable" onClick={() => saveScheduleState('Defined')}> D </div>
                <div className="box-letter yes clickable" onClick={() => saveScheduleState('In-Progress')}> P </div>
                <div className="box-letter yes"> C </div>
                <div className="box-letter"> A </div>
            </div>
        );
    }
    if (item.data.ScheduleState === 'Accepted') {
        return (
            <div className="state-view-container">
                <div className="box-letter clickable yes" onClick={() => saveScheduleState('Defined')}> D </div>
                <div className="box-letter clickable yes" onClick={() => saveScheduleState('In-Progress')}> P </div>
                <div className="box-letter clickable yes" onClick={() => saveScheduleState('Completed')}> C </div>
                <div className="box-letter yes"> A </div>
            </div>
        );
    }
    return (
        <div> {item.data.ScheduleState} </div>
    );
}
