/*global React */

import { isSupport } from './util.js';
import Confetti from './Confetti.js';

const RES_ADDITIONAL = '[support] Additional Artifact Created';
const RES_NO_CHANGE = '[support] Solved Without Change';
const RES_CODE_CHANGE = 'Code Change';

export default function Action(props) {

    const {
        artifact,
        onSave,
        startBlockOn,
        user,
    } = props;

    const isMine = artifact.data?.Owner && artifact.data.Owner._refObjectUUID === user._refObjectUUID;

    const [burst, setBurst] = React.useState(0);
    const [burstActive, setBurstActive] = React.useState(false);

    const celebrate = React.useCallback(() => {
        setBurst((b) => (b + 1));
        setBurstActive(true);
    }, []);

    const save = React.useCallback(() => {
        artifact.save({
            callback: onSave,
        });
    }, [artifact, onSave]);

    const unblock = () => {
        artifact.set('Blocked', false);
        save();
    };

    const blockOnPR = () => {
        if (artifact.isTask()) {
            artifact.set('State', 'Completed');
        }
        else {
            artifact.set('ScheduleState', 'Completed');
        }

        artifact.set('Blocked', true);
        artifact.set('BlockedReason', 'PR');
        save();
    };

    const closeOut = React.useCallback((resolution) => {
        if (artifact.isDefect()) {
            artifact.set('State', 'Fixed');
            artifact.set('Resolution', resolution);
            artifact.set('Fixed In Build', artifact.data.Release?.Name);
        }

        artifact.set('Blocked', false);

        celebrate();

        save();
    }, [artifact, save, celebrate]);

    const backBurner = () => {
        if (artifact.isTask()) {
            artifact.set('State', 'Defined');
        }
        else {
            artifact.set('ScheduleState', 'Defined');
        }
        save();
    };

    const take = () => {
        if (artifact.isTask()) {
            artifact.set('State', 'In-Progress');
        }
        else {
            artifact.set('ScheduleState', 'In-Progress');
        }

        artifact.set('Owner', user);
        artifact.set('Blocked', false);
        save();
    };

    const takeOwnerOnly = () => {
        artifact.set('Owner', user);
        save();
    };

    const ditch = () => {
        if (artifact.isTask()) {
            artifact.set('State', 'Defined');
        }
        else {
            artifact.set('ScheduleState', 'Defined');
        }

        artifact.set('Owner', null);
        save();
    };

    const blockOn = () => {
        if (artifact.isTask()) {
            startBlockOn(artifact);
        }
    };

    let myCloseOutOpts = React.useMemo(() => {
        let rv = [];
        if (isSupport(artifact)) {
            rv.push({
                label: 'Close Additional Artifact',
                title: `State to Fixed, Fixed in build to ${artifact.data.Release?.Name}, Resolution to "${RES_ADDITIONAL}"`,
                func: () => closeOut(RES_ADDITIONAL),
            });

            rv.push({
                label: 'Close - No Change',
                title: `State to Fixed, Fixed in build to ${artifact.data.Release?.Name}, Resolution to "${RES_NO_CHANGE}"`,
                func: () => closeOut(RES_NO_CHANGE),
            });
        }

        rv.push({
            label: 'Close',
            title: `State to Fixed, Fixed in build to ${artifact.data.Release?.Name}, Resolution to "${RES_CODE_CHANGE}"`,
            func: () => closeOut(RES_CODE_CHANGE),
        });

        return rv;
    }, [artifact, closeOut]);

    const Mapper = {
        'Defined': {
            mine: [
                {
                    label: 'Start',
                    title: 'State to In-Progress and unblock',
                    func: take,
                },
                {
                    label: 'Ditch',
                    title: 'Set to no owner',
                    func: ditch,
                },
                {
                    label: 'Block On',
                    title: 'Select another task from the story to block this task on',
                    func: blockOn,
                    type: 'task',
                },
            ],
            other: [
                {
                    label: 'Take',
                    title: 'State to In-Progress, owner to you and unblock',
                    func: take,
                },
                {
                    label: 'Block On',
                    title: 'Select another task from the story to block this task on',
                    func: blockOn,
                    type: 'task',
                },
            ]
        },
        'In-Progress': {
            mine: [
                {
                    label: 'Block on PR',
                    title: 'State to Completed, blocked true with reason "PR"',
                    func: blockOnPR,
                },
                {
                    label: 'Back Burner',
                    title: 'State to Defined',
                    func: backBurner,
                },
                {
                    label: 'Ditch',
                    title: 'State to Defined, and no owner',
                    func: ditch,
                }
            ],
            other: [
                {
                    label: 'Take',
                    title: 'Set owner to you and unblock',
                    func: take,
                },
            ]
        },
        'Completed': {
            mine: [
                ...myCloseOutOpts,
                {
                    label: 'Re-Open',
                    title: 'State to In-Progress and unblock',
                    func: take,
                },
            ],
            other: [
                {
                    label: 'Take',
                    title: 'Set the owner to you',
                    func: takeOwnerOnly,
                },
            ]
        },
        'Accepted': {
            mine: [],
            other: []
        }
    };

    let state;
    if (artifact.isDefect()) {
        state = artifact.data.ScheduleState;
    }
    else {
        state = artifact.data.State;
    }

    const buttonConfigs = Mapper[state][isMine ? 'mine' : 'other'] || [];
    const buttons = buttonConfigs.filter((bb) => {
        if (bb.type) {
            if (bb.type === 'task') {
                return artifact.isTask();
            }
            console.error('unimplemented');
        }
        return true;
    }).map((bb) => {
        return (
            <div key={bb.label} title={bb.title} className="button" onClick={bb.func}>
                {bb.label}
            </div>
        );
    });

    if (state !== 'Completed' && artifact.data.Blocked) {
        buttons.push(
            <div key="unblock" title="Set Blocked to false" className="button" onClick={unblock}>
                Unblock
            </div>
        );
    }

    const onBurstAnimationEnd = React.useCallback(() => {
        setBurstActive(false);
    }, []);

    return (
        <>
            <div className="action">
                {buttons}
            </div>
            {burstActive && <Confetti key={burst} onAnimationEnd={onBurstAnimationEnd} />}
        </>
    );

}
