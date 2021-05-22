"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const tl = __importStar(require("azure-pipelines-task-lib"));
const azdev = __importStar(require("azure-devops-node-api/WebApi"));
async function run() {
    try {
        const collectionUri = tl.getEndpointUrl('SYSTEMVSSCONNECTION', true);
        const token = tl.getEndpointAuthorizationParameter('SYSTEMVSSCONNECTION', 'AccessToken', true);
        if (collectionUri === undefined || token === undefined) {
            throw Error(`System.AccessToken is not available.`);
        }
        const connection = await getAzureDevOpsConnection(collectionUri, token);
        const teamProject = getAzureDevOpsVariable('System.TeamProject');
        const hostType = getAzureDevOpsVariable('System.HostType').toLowerCase();
        switch (hostType) {
            case 'build': {
                const buildId = Number(getAzureDevOpsVariable('Build.BuildId'));
                const definitionId = Number(tl.getVariable('System.DefinitionId'));
                const numberOfMonthsToRetain = Number(getAzureDevOpsInput('months'));
                const daysValid = calculateDaysValid(numberOfMonthsToRetain);
                const owner = getOwner();
                await setBuildRetentionLease(teamProject, buildId, definitionId, daysValid, owner, connection);
                break;
            }
            case 'deployment':
            case 'release': {
                const releaseId = Number(getAzureDevOpsVariable('Release.ReleaseId'));
                await retainReleaseForever(teamProject, releaseId, connection);
                if (tl.getBoolInput('retainbuilds')) {
                    retainReleaseBuildArtifacts(teamProject, releaseId, connection);
                }
                break;
            }
            default: {
                throw Error(`Unknown hosttype: ${hostType}`);
            }
        }
        tl.setResult(tl.TaskResult.Succeeded, '');
    }
    catch (err) {
        tl.setResult(tl.TaskResult.Failed, err);
    }
}
run();
async function retainReleaseForever(teamProject, releaseId, connection) {
    const releaseApi = await connection.getReleaseApi();
    const releaseMetadata = {
        comment: getOwner(),
        keepForever: true
    };
    await releaseApi.updateReleaseResource(releaseMetadata, teamProject, releaseId);
    console.log(`Retained this release forever.`);
}
async function retainReleaseBuildArtifacts(teamProject, releaseId, connection) {
    const releaseApi = await connection.getReleaseApi();
    const release = await releaseApi.getRelease(teamProject, releaseId);
    if (!release.artifacts)
        return;
    for (const artifact of release.artifacts.filter(x => x.type === 'Build')) {
        const buildId = Number(tl.getVariable(`Release.Artifacts.${artifact.alias}.BuildId`));
        const definitionId = Number(tl.getVariable(`Release.Artifacts.${artifact.alias}.DefinitionId`));
        const daysValid = calculateDaysValid(30 * 12);
        const owner = `Retained by Release ${releaseId}.`;
        await setBuildRetentionLease(teamProject, buildId, definitionId, daysValid, owner, connection);
    }
}
async function setBuildRetentionLease(teamProject, runId, definitionId, daysValid, owner, connection) {
    const retentionLease = [];
    retentionLease.push({
        runId: runId,
        definitionId: definitionId,
        protectPipeline: true,
        daysValid: daysValid,
        ownerId: owner,
    });
    const buildApi = await connection.getBuildApi();
    await buildApi.addRetentionLeases(retentionLease, teamProject);
    console.log(`Retained pipeline run ${runId} for '${daysValid} days', including its tests and artifacts.`);
}
function getOwner() {
    return tl.getInput('owner') || `${tl.getVariable("System.TeamProject")} Retention owner`;
}
function calculateDaysValid(numberOfMonths) {
    // If 0, retain for 30 years
    if (numberOfMonths === 0)
        numberOfMonths = 30 * 12;
    const endDate = new Date();
    const todayDate = new Date();
    endDate.setMonth(endDate.getMonth() + numberOfMonths);
    const timeDifference = endDate.getTime() - todayDate.getTime();
    const dayDifference = timeDifference / (1000 * 3600 * 24);
    return Math.round(dayDifference);
}
function getAzureDevOpsVariable(name) {
    const value = tl.getVariable(name) || undefined;
    if (value === undefined)
        throw Error(`Variable ${name} is empty`);
    return value;
}
function getAzureDevOpsInput(name) {
    const value = tl.getInput(name) || undefined;
    if (value === undefined)
        throw Error(`Input ${name} is empty`);
    return value;
}
async function getAzureDevOpsConnection(collectionUri, token) {
    const accessTokenHandler = azdev.getPersonalAccessTokenHandler(token);
    const requestOptions = {
        socketTimeout: 10000,
        allowRetries: true,
        maxRetries: 3,
    };
    const agentProxy = tl.getHttpProxyConfiguration();
    let proxyConfiguration;
    if (agentProxy) {
        proxyConfiguration = {
            proxyUrl: agentProxy.proxyUrl,
            proxyUsername: agentProxy.proxyUsername,
            proxyPassword: agentProxy.proxyPassword,
            proxyBypassHosts: agentProxy.proxyBypassHosts
        };
        requestOptions.proxy = proxyConfiguration;
    }
    const connection = new azdev.WebApi(collectionUri, accessTokenHandler, requestOptions);
    if (!connection)
        throw Error(`Connection cannot be made to Azure DevOps.`);
    return connection;
}
//# sourceMappingURL=index.js.map