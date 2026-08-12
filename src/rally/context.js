/*global $RallyContext */

// Wraps RallyContext in methods similair to depricated App Sdk

function readContext() {
    try {
        return $RallyContext || null;
    }
    catch (_err) {
        return null;
    }
}

export function getContext() {
    return readContext();
}

export function getOrigin() {
    const ctx = readContext();
    return ctx?.Url?.origin || window.location.origin;
}

export function getUser() {
    return readContext()?.User || null;
}

export function getWorkspaceRef() {
    return readContext()?.GlobalScope?.Workspace?._ref || null;
}

export function getProjectRef() {
    return readContext()?.GlobalScope?.Project?._ref || null;
}

export function getProjectScope() {
    const scope = readContext()?.GlobalScope;
    return {
        up: Boolean(scope?.ProjectScopeUp),
        down: scope?.ProjectScopeDown === undefined ? true : Boolean(scope.ProjectScopeDown),
    };
}

function getViewFilter() {
    return readContext()?.ViewFilter || null;
}

export function getViewFilterIteration() {
    const filter = getViewFilter();
    if (filter?.Type !== 'Iteration') {
        return null;
    }
    if (!filter.Value?._ref) {
        return null;
    }
    return filter.Value;
}
