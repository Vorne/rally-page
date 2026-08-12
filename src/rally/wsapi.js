import {
    getOrigin,
    getProjectRef,
    getProjectScope,
    getWorkspaceRef,
} from './context.js';

const WSAPI_VERSION = 'v2.0';
const PAGE_SIZE = 200;

function combine(clauses, operator) {
    const usable = clauses.filter(Boolean);
    if (usable.length === 0) {
        return null;
    }
    return usable.reduce((left, right) => `(${left} ${operator} ${right})`);
}

export function and(...clauses) {
    return combine(clauses, 'AND');
}

function formatValue(value) {
    if (typeof value === 'boolean' || typeof value === 'number') {
        return String(value);
    }
    return `"${String(value).replace(/"/g, '\\"')}"`;
}

export function where(property, operator, value) {
    return `(${property} ${operator} ${formatValue(value)})`;
}

function buildUrl(resource, params) {
    const url = new URL(`${getOrigin()}/slm/webservice/${WSAPI_VERSION}/${resource}`);

    const workspace = getWorkspaceRef();
    if (workspace) {
        url.searchParams.set('workspace', workspace);
    }

    const project = getProjectRef();
    if (project) {
        const scope = getProjectScope();
        url.searchParams.set('project', project);
        url.searchParams.set('projectScopeUp', String(scope.up));
        url.searchParams.set('projectScopeDown', String(scope.down));
    }

    Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
            url.searchParams.set(key, String(value));
        }
    });

    return url.toString();
}

function unwrap(json) {
    const key = Object.keys(json)[0];
    return json[key];
}

async function send(url, options) {
    const response = await fetch(url, {
        method: options?.method || 'GET',
        credentials: 'include',
        headers: options?.headers || { Accept: 'application/json' },
        body: options?.body,
    });

    if (response.status === 401 || response.status === 403) {
        throw new Error('Rally rejected the request as unauthenticated. The Custom View\'s Rally session may have expired -- reload the page.');
    }

    if (!response.ok) {
        throw new Error(`Rally request failed: ${response.status} ${response.statusText}`);
    }

    const result = unwrap(await response.json());

    if (result?.Errors?.length > 0) {
        throw new Error(result.Errors.join('; '));
    }

    return result;
}

function request(resource, params) {
    return send(buildUrl(resource, params));
}

function endpoint(pathName) {
    return `${getOrigin()}/slm/webservice/${WSAPI_VERSION}/${pathName}`;
}

function hostSecurityToken() {
    const hosts = [window.parent, window.top];

    for (let i = 0; i < hosts.length; i += 1) {
        try {
            const token = hosts[i]?.Rally?.env?.IoProvider?.getSecurityToken?.();
            if (token) {
                return token;
            }
        }
        catch (_err) {
        }
    }

    return null;
}

export async function update(typeName, objectId, changes) {
    const token = hostSecurityToken();

    if (!token) {
        throw new Error('Could not read Rally\'s security token from the host page, so this change cannot be saved. Reload the Custom View; if it keeps happening the widget may no longer have access to the Rally session.');
    }

    const url = new URL(endpoint(`${typeName}/${objectId}`));
    url.searchParams.set('key', token);

    const workspace = getWorkspaceRef();
    if (workspace) {
        url.searchParams.set('workspace', workspace);
    }

    const result = await send(url.toString(), {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [typeName]: changes }),
    });

    return result.Object || null;
}

async function query(resource, options) {
    const {
        exactProject,
        fetchFields,
        order,
        queryString,
        types,
    } = options;

    let start = 1;
    let total = null;
    let results = [];

    while (total === null || results.length < total) {
        const page = await request(resource, {
            fetch: fetchFields ? fetchFields.join(',') : true,
            order,
            pagesize: PAGE_SIZE,
            query: queryString,
            start,
            types,
            projectScopeUp: exactProject ? false : undefined,
            projectScopeDown: exactProject ? false : undefined,
        });

        total = page.TotalResultCount;
        const batch = page.Results || [];
        results = results.concat(batch);

        if (batch.length === 0) {
            break;
        }

        start += batch.length;
    }

    return results;
}

export function queryArtifacts(options) {
    return query('artifact', {
        ...options,
        types: 'hierarchicalrequirement,defect',
    });
}

export function queryTasks(options) {
    return query('task', options);
}

export function queryIterations(options) {
    return query('iteration', options);
}
