/*global React */

import {
    getBlockedHtml,
    getLink,
    taskSort,
} from './util.js';
import Owner from './Owner.js';
import ArtifactName from './ArtifactName.js';
import Action from './Action.js';
import TaskEstimate from './TaskEstimate.js';
import TaskToDo from './TaskToDo.js';
import StateView from './StateView.js';

export default function TaskTable(props) {

    const {
        model,
        user,
        onSave,
    } = props;

    const [taskResponse, setTaskResponse] = React.useState({
        state: 'init',
        records: [],
    });

    const [activeBlockOnTask, setActiveBlockOnTask] = React.useState(false);

    const startBlockOn = (artifact) => {
        setActiveBlockOnTask(artifact);
    };

    React.useEffect(() => {
        if (taskResponse.state === 'init' && model.canHaveTasks() && model.data.Tasks.Count > 0) {
            setTaskResponse({
                ...taskResponse,
                state: 'pending',
            });
            model.getCollection('Tasks').load({
                fetch: [
                    'Blocked',
                    'BlockedReason',
                    'Connections',
                    'Description',
                    'DisplayName',
                    'Estimate',
                    'Estimate',
                    'FormattedId',
                    'Name',
                    'Owner',
                    'State',
                    'ToDo',
                    'UserName',
                ],
                callback: function(records, _operation, _success) {
                    setTaskResponse({
                        state: 'success',
                        records,
                    });
                }
            });
        }
    }, [model, setTaskResponse, taskResponse]);

    // process the response tasks from rally to what is actually going to be displayed
    const tasks = React.useMemo(() => {
        return taskResponse.records
            .filter((tt) => {
                if (tt.data.State === 'Defined' || tt.data.State === 'In-Progress') {
                    return true;
                }
                if (tt.data.Blocked) {
                    return true;
                }
                return false;
            })
            .sort(taskSort);
    }, [taskResponse.records]);

    const renderTasks = () => {
        return tasks.map((tt) => {
            let className = '';
            if (tt.data.Blocked) {
                className = 'blocked';
            }

            const assignBlockReason = () => {
                let blockedReason = activeBlockOnTask.data.BlockedReason;
                if (blockedReason.length > 0) {
                    blockedReason = `${blockedReason}, ${tt.data.FormattedID}`;
                }
                else {
                    blockedReason = `${tt.data.FormattedID}`;
                }
                activeBlockOnTask.set('Blocked', true);
                activeBlockOnTask.set('BlockedReason', blockedReason);
                activeBlockOnTask.save({
                    callback: onSave,
                });
                setActiveBlockOnTask(false);
            };

            const renderTaskId = () => {
                if (activeBlockOnTask) {
                    if (tt.data._ref === activeBlockOnTask.data._ref) {
                        return <span> {tt.data.FormattedID} </span>;
                    }
                    return <span className="button" onClick={assignBlockReason}> {tt.data.FormattedID} </span>;

                }

                return <a href={getLink(tt)} > {tt.data.FormattedID} </a>;
            };

            return (
                <tr className={className} key={tt.data.FormattedID} >
                    <td>
                        {renderTaskId()}
                    </td>
                    <td>
                        <ArtifactName record={tt} />
                    </td>
                    <td className="task-table-number">
                        <TaskEstimate item={tt} />
                    </td>
                    <td className="task-table-number">
                        <TaskToDo item={tt} />
                    </td>
                    <td>
                        <StateView item={tt} onSave={onSave} />
                    </td>
                    <td>
                        {getBlockedHtml(tt.data)}
                    </td>
                    <td>
                        <Owner artifact={tt.data} user={user} />
                    </td>
                    <td>
                        <Action artifact={tt} user={user} onSave={onSave} startBlockOn={startBlockOn} />
                    </td>
                </tr>
            );
        });
    };

    if (tasks.length === 0) {
        return null;
    }

    return (
        <div>
            <table className="mytable">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Est.</th>
                        <th>ToDo</th>
                        <th>State</th>
                        <th>Blocked</th>
                        <th>Owner</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {renderTasks()}
                </tbody>
            </table>
        </div>
    );

}
