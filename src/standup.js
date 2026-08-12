/*global React, ReactDOM */

// Stand Up dashboard as a Rally Custom View widget.

import './styles.css';
import './widget.css';
import TimeLeft from './TimeLeft.js';
import RefreshButton from './RefreshButton.js';
import DefectSummary from './DefectSummary.js';
import DefectTable from './DefectTable.js';
import UserStoryTable from './UserStoryTable.js';
import IterationPicker from './IterationPicker.js';
import { who } from './util.js';
import {
    getContext,
    getUser,
    getViewFilterIteration,
} from './rally/context.js';
import { makeRecords } from './rally/record.js';
import {
    and,
    queryArtifacts,
    queryIterations,
    where,
} from './rally/wsapi.js';

const ARTIFACT_FIELDS = [
    'Blocked',
    'BlockedReason',
    'c_IsCustomer',
    'c_Lifecycle',
    'c_PrioritizedbySS',
    'Connections',
    'CreationDate',
    'Discussion',
    'DisplayName',
    'FormattedID',
    'Name',
    'ObjectID',
    'Owner',
    'PlanEstimate',
    'Priority',
    'Release',
    'ScheduleState',
    'Severity',
    'State',
    'Tags',
    'Tasks',
    'UserName',
];

const ITERATION_FIELDS = ['EndDate', 'Name', 'ObjectID', 'StartDate'];

const ITERATION_HISTORY_DAYS = 365;

function isoDaysAgo(days) {
    return new Date(Date.now() - (days * 24 * 60 * 60 * 1000)).toISOString();
}

function currentIteration(list) {
    const now = new Date();

    const active = list.find((it) => new Date(it.StartDate) <= now && new Date(it.EndDate) >= now);
    if (active) {
        return active;
    }

    return list.find((it) => new Date(it.EndDate) < now) || list[0] || null;
}

function MainElement() {
    const user = getUser() || {};

    const [iteration, setIteration] = React.useState(getViewFilterIteration());
    const [iterationOptions, setIterationOptions] = React.useState([]);
    const [records, setRecords] = React.useState([]);
    const [error, setError] = React.useState(null);
    const [refreshNonce, setRefreshNonce] = React.useState(0);

    const viewFilterIteration = getViewFilterIteration();
    const usingViewFilter = Boolean(viewFilterIteration);

    React.useEffect(() => {
        if (usingViewFilter) {
            setIteration(viewFilterIteration);
            return;
        }

        queryIterations({
            exactProject: true,
            fetchFields: ITERATION_FIELDS,
            order: 'StartDate DESC,EndDate DESC',
            queryString: where('EndDate', '>=', isoDaysAgo(ITERATION_HISTORY_DAYS)),
        })
            .then((results) => {
                setIterationOptions(results);
                setIteration((current) => current || currentIteration(results));
            })
            .catch((err) => {
                console.error('failed to load iterations', err);
                setError(err.message);
            });
    }, [usingViewFilter, viewFilterIteration, refreshNonce]);

    React.useEffect(() => {
        if (!iteration?._ref) {
            return;
        }

        setError(null);

        queryArtifacts({
            fetchFields: ARTIFACT_FIELDS,
            queryString: and(
                where('Iteration', '=', iteration._ref),
                where('ScheduleState', '!=', 'Accepted'),
            ),
        })
            .then((results) => {
                setRecords(makeRecords(results));
            })
            .catch((err) => {
                console.error('failed to load artifacts', err);
                setError(err.message);
            });
    }, [iteration, refreshNonce]);

    const onRefresh = () => {
        setRefreshNonce((nonce) => nonce + 1);
    };

    const onSave = (_record, _operation, success, err) => {
        setError(success ? null : `Save failed: ${err?.message || 'unknown error'}`);
        setRefreshNonce((nonce) => nonce + 1);
    };

    const onPickIteration = (ref) => {
        setIteration(iterationOptions.find((it) => it._ref === ref) || null);
    };

    const defectRecords = React.useMemo(() => {
        return records.filter((rr) => {
            // don't include any records that have tasks, those will end up being shown in the story tables
            if (rr.canHaveTasks() && rr.data.Tasks.Count > 0) {
                return false;
            }

            if (rr.isDefect()) {
                if (rr.data.ScheduleState === 'Completed' || rr.data.ScheduleState === 'Accepted') {
                    if (rr.data.Blocked) {
                        return true;
                    }
                    if (rr.data.State !== 'Fixed' && rr.data.State !== 'Closed') {
                        return true;
                    }
                }
                else {
                    return true;
                }
            }
            return false;
        });
    }, [records]);

    const storyRecords = React.useMemo(() => {
        return records.filter((rr) => {
            if (rr.data.ScheduleState === 'Defined' || rr.data.ScheduleState === 'In-Progress') {
                // anything that can and does have tasks will be displayed
                if (rr.canHaveTasks() && rr.data.Tasks.Count > 0) {
                    return true;
                }
                // all users stories will be displayed regardless of if they have tasks
                if (rr.isUserStory()) {
                    return true;
                }
            }
            else if (rr.data.Blocked && rr.isUserStory()) {
                return true;
            }

            if (rr.isUserStory() && rr.data.c_Lifecycle !== 'Complete') {
                return true;
            }

            return false;
        });
    }, [records]);

    const renderError = () => {
        if (!error) {
            return null;
        }
        return <div className="widget-error"> {error} </div>;
    };

    const renderUserWarning = () => {
        if (user._ref) {
            return null;
        }
        return (
            <div className="widget-error">
                No Rally user in the widget context: taking ownership of work will not save.
            </div>
        );
    };

    const renderPicker = () => {
        if (usingViewFilter) {
            return null;
        }
        return (
            <IterationPicker
                iterations={iterationOptions}
                value={iteration?._ref}
                onChange={onPickIteration}
            />
        );
    };

    const userName = who(user);
    return (
        <div className={`main-container ${userName}`}>
            {renderUserWarning()}
            {renderError()}
            {renderPicker()}
            <TimeLeft date={iteration?.EndDate} />
            <DefectSummary records={records} />
            <RefreshButton onClick={onRefresh} />
            <DefectTable records={defectRecords} user={user} onSave={onSave} />
            <UserStoryTable records={storyRecords} user={user} onSave={onSave} />
        </div>
    );
}

function mount() {
    const root = document.getElementById('root');

    if (!getContext()) {
        root.textContent = 'No Rally context available. This page only runs as a Rally Custom HTML widget.';
        return;
    }

    root.textContent = '';
    ReactDOM.createRoot(root).render(<MainElement />);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
}
else {
    mount();
}
