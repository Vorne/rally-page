import { getOrigin } from './context.js';
import {
    queryTasks,
    update,
    where,
} from './wsapi.js';

const DETAIL_SLUGS = {
    defect: 'defect',
    hierarchicalrequirement: 'userstory',
    task: 'task',
};

const ALWAYS_FETCH = ['FormattedID', 'ObjectID', 'Tags'];

const FIELD_ALIASES = {
    'Fixed In Build': 'FixedInBuild',
};

function attributeName(field) {
    return FIELD_ALIASES[field] || field.replace(/\s+/g, '');
}

function attributeValue(value) {
    if (value === null || value === undefined) {
        return null;
    }
    if (typeof value === 'object') {
        if (!value._ref) {
            throw new Error('cannot save an object without a _ref');
        }
        return value._ref;
    }
    return value;
}

function emptyCollection() {
    return {
        Count: 0,
        _tagsNameArray: [],
    };
}

function normalize(json) {
    if (!json.Tags) {
        json.Tags = emptyCollection();
    }
    if (!json.Tags._tagsNameArray) {
        json.Tags._tagsNameArray = [];
    }
    if (json.Tags.Count === undefined) {
        json.Tags.Count = json.Tags._tagsNameArray.length;
    }

    if (!json.Tasks) {
        json.Tasks = { Count: 0 };
    }
    if (json.Tasks.Count === undefined) {
        json.Tasks.Count = 0;
    }

    if (json.BlockedReason === undefined || json.BlockedReason === null) {
        json.BlockedReason = '';
    }

    return json;
}

function makeRecord(json) {
    const data = normalize(json);
    const type = String(data._type || '').toLowerCase();

    let pending = {};

    const isUserStory = () => type === 'hierarchicalrequirement';
    const isDefect = () => type === 'defect';
    const isTask = () => type === 'task';

    const record = {
        data,

        isUserStory,
        isDefect,
        isTask,
        canHaveTasks: () => isUserStory() || isDefect(),

        getDetailUrl: () => {
            const slug = DETAIL_SLUGS[type];
            if (!slug || !data.ObjectID) {
                return data._ref || '';
            }
            return `${getOrigin()}/#/detail/${slug}/${data.ObjectID}`;
        },

        getCollection: (name) => ({
            load: (options) => {
                if (name !== 'Tasks') {
                    throw new Error(`getCollection('${name}') is not supported`);
                }

                const fields = Array.from(new Set([...(options.fetch || []), ...ALWAYS_FETCH]));

                queryTasks({
                    fetchFields: fields,
                    queryString: where('WorkProduct', '=', data._ref),
                })
                    .then((results) => {
                        options.callback(results.map(makeRecord), null, true);
                    })
                    .catch((err) => {
                        console.error('failed to load tasks', err);
                        options.callback([], null, false);
                    });
            },
        }),

        set: (field, value) => {
            pending[attributeName(field)] = attributeValue(value);
            data[field] = value;
        },

        save: (options) => {
            const changes = pending;
            pending = {};

            if (!data.ObjectID) {
                const err = new Error(`cannot save ${data.FormattedID || 'record'}: no ObjectID`);
                options?.callback?.(record, null, false, err);
                return;
            }

            update(data._type, data.ObjectID, changes)
                .then((updated) => {
                    if (updated) {
                        const { _type: _ignoredType, ObjectID: _ignoredId, ...fields } = normalize(updated);

                        Object.assign(data, fields);
                    }
                    options?.callback?.(record, null, true, null);
                })
                .catch((err) => {
                    console.error('failed to save', data.FormattedID, err);
                    pending = { ...changes, ...pending };
                    options?.callback?.(record, null, false, err);
                });
        },
    };

    return record;
}

export function makeRecords(list) {
    return (list || []).map(makeRecord);
}
