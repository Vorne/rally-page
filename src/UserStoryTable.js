/*global */

// cSpell: ignore Cust

import ReleaseName from './ReleaseName.js';
import TaskTable from './TaskTable.js';

import {
    getBlockedHtml,
    getLifeCycleButton,
    getLink,
    storySort,
} from './util.js';
import Owner from './Owner.js';

export default function UserStoryTable(props) {

    const {
        onSave,
        records,
        user,
        refreshNonce,
    } = props;

    const renderRecords = () => {
        return records
            .sort(storySort)
            .map((rr) => {
                let artClassName;
                if (rr.isDefect()) {
                    artClassName = 'defect-id';
                }
                else if (rr.isUserStory()) {
                    artClassName = 'story-id';
                }
                const save = () => {
                    rr.save({
                        callback: onSave,
                    });
                };

                const getEstimate = () => {
                    if (rr.data.PlanEstimate || rr.data.PlanEstimate === 0) {
                        return <span className="story-estimate">{rr.data.PlanEstimate}</span>;
                    }
                };

                return (
                    <div className="story-chunk" key={rr.data.FormattedID}>
                        <div className="story-title">
                            <ReleaseName artifact={rr} />
                            <span className={artClassName}>{rr.data.FormattedID}</span>
                            <span className="artifact-title"> <a href={getLink(rr)}> {rr.data.Name} </a> </span>
                            <span className="lifecycle"> {rr.data.c_Lifecycle} </span>
                            {getLifeCycleButton(rr, save)}
                            {getEstimate()}
                            {getBlockedHtml(rr.data)}
                            <span className="story-owner">
                                <Owner artifact={rr.data} user={user} />
                            </span>
                        </div>
                        <TaskTable model={rr} user={user} onSave={onSave} refreshNonce={refreshNonce} />
                    </div>
                );
            });
    };
    return (
        <div className="story-display">
            {renderRecords()}
        </div>
    );
}
