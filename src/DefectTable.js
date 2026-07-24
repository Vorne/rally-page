/*global moment React */

import {
    getBlockedHtml,
    getLink,
    itemSort2,
    isSupport,
} from './util.js';
import Owner from './Owner.js';
import Action from './Action.js';
import ReleaseName from './ReleaseName.js';
import StateView from './StateView.js';

import ArtifactName from './ArtifactName.js';

export default function DefectTable(props) {

    const {
        onSave,
        records,
        user,
    } = props;

    const tableRef = React.useRef(null);

    const renderRecords = () => {
        return records
            .sort(itemSort2)
            .map((rr) => {
                const link = getLink(rr);
                let className = '';
                if (rr.data.Blocked) {
                    className = 'blocked';
                }
                let thing = null;

                const support = isSupport(rr);

                if (support) {
                    thing = <span style={{ fontSize: '18px' }} > {String.fromCodePoint(128222)} </span>;
                }
                else if (rr.data.c_IsCustomer) {
                    thing = <span style={{ fontSize: '18px' }} > {String.fromCodePoint(128556)} </span>;
                }
                else if (rr.data.Severity === 'Internal') {
                    thing = <span style={{ fontSize: '18px' }} > {String.fromCodePoint(129729)} </span>;
                }

                let prioritized = null;

                if (rr.data.c_PrioritizedbySS) {
                    prioritized = <span style={{ fontSize: '18px' }} > {String.fromCodePoint(0x2714)} </span>;
                }

                if (rr.canHaveTasks() && rr.data.Tasks.Count > 0) {
                    className += ' defect-with-tasks';
                }

                const renderAge = () => {
                    const age = moment(new Date()).diff(new Date(rr.data.CreationDate), 'days');

                    if (age > 90) {
                        return (
                            <td>
                                <div className="parchment">
                                    <div className="background">
                                        {age}
                                    </div>
                                    <div className="text">
                                        {age}
                                    </div>
                                </div>
                            </td>
                        );
                    }
                    return (
                        <td>
                            <div className="age">{age}</div>
                        </td>
                    );
                };

                return (
                    <tr className={className} key={rr.data.FormattedID} >
                        <td>
                            <ReleaseName artifact={rr} />
                        </td>
                        {renderAge()}
                        <td>
                            <a href={link}> {rr.data.FormattedID} </a>
                        </td>
                        <td>
                            <ArtifactName record={rr} />
                        </td>
                        <td>
                            <div className="thing">
                                {thing}
                            </div>
                        </td>
                        <td>
                            {rr.data.Priority}
                        </td>
                        <td>
                            {prioritized}
                        </td>
                        <td>
                            <StateView item={rr} onSave={onSave} />
                        </td>
                        <td>
                            {getBlockedHtml(rr.data)}
                        </td>
                        <td>
                            <Owner artifact={rr.data} user={user} />
                        </td>
                        <td>
                            <Action artifact={rr} user={user} onSave={onSave} />
                        </td>
                    </tr>
                );
            });
    };

    const handleCopy = async () => {
        const htmlContent = tableRef.current.innerHTML;
        const plainTextContent = tableRef.current.innerText;
        const clipboardItem = new ClipboardItem({
            'text/html': new Blob([htmlContent], { type: 'text/html' }),
            'text/plain': new Blob([plainTextContent], { type: 'text/plain' }),
        });
        await navigator.clipboard.write([clipboardItem]);

    };

    const renderHiddenTable = () => {
        const renderHiddenRecord = () => {
            return records
                .sort(itemSort2)
                .map((rr) => {
                    const link = getLink(rr);
                    return (
                        <li key={rr.data.FormattedID} >
                            <a href={link}> {rr.data.FormattedID} </a>
                            {rr.data.Name}
                        </li>
                    );
                });
        };

        const style = {
            position: 'absolute',
            left: '-9999px', // Hides the element off-screen
            opacity: 0,      // Makes it invisible
            height: 0,       // Prevents it from taking up space
            overflow: 'hidden', // Hides any overflow content
        };

        return (
            <ul
                ref={tableRef}
                style={style}
            >
                {renderHiddenRecord()}
            </ul>
        );
    };

    return (
        <div className="defect-display">
            <table className="mytable">
                <thead>
                    <tr>
                        <th>Release</th>
                        <th>Age</th>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Visible</th>
                        <th>Priority</th>
                        <th>S/S</th>
                        <th>State</th>
                        <th>Blocked</th>
                        <th>Owner</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {renderRecords()}
                </tbody>
            </table>
            {renderHiddenTable()}
            <button onClick={handleCopy}>Copy as list</button>
        </div>
    );
}
