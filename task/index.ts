import * as tl from 'azure-pipelines-task-lib';
import * as azdev from 'azure-devops-node-api/WebApi';
import * as ba from 'azure-devops-node-api/BuildApi';
import * as ra from 'azure-devops-node-api/ReleaseApi';


import { IProxyConfiguration, IRequestOptions } from 'azure-devops-node-api/interfaces/common/VsoBaseInterfaces';
import { Release, ReleaseUpdateMetadata } from 'azure-devops-node-api/interfaces/ReleaseInterfaces';
import { NewRetentionLease } from 'azure-devops-node-api/interfaces/BuildInterfaces';

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
            
            let daysValid = 0;
            if (numberOfMonthsToRetain === 0) daysValid = 36501;
            else daysValid = calculateDaysValid(numberOfMonthsToRetain);

            const owner = `Pipeline Retention Task`;
            await setBuildRetentionLease(teamProject, buildId, definitionId, daysValid, owner, connection);
            break;
         }
         case 'deployment':
         case 'release': {
            const releaseId = Number(getAzureDevOpsVariable('Release.ReleaseId'));
            const definitionName = getAzureDevOpsVariable('System.Definitionname');
            await retainReleaseForever(teamProject, releaseId, connection);
            if (tl.getBoolInput('retainbuilds')) {
               retainReleaseBuildArtifacts(teamProject, releaseId, definitionName, connection);
            }
            break;
         }
         default: {
            throw Error(`Unknown hosttype: ${hostType}`);
         }
      }
      tl.setResult(tl.TaskResult.Succeeded, '');
   }
   catch (err: any) {
      tl.setResult(tl.TaskResult.Failed, err.message)
   }
}

run();

async function retainReleaseForever(teamProject: string, releaseId: number, connection: azdev.WebApi): Promise<void> {
   const releaseApi: ra.IReleaseApi = await connection.getReleaseApi();
   const releaseMetadata: ReleaseUpdateMetadata = {
      comment: `Retained by custom retention task`,
      keepForever: true
   };
   await releaseApi.updateReleaseResource(releaseMetadata, teamProject, releaseId);
   console.log(`Retained this release forever.`);
}

async function retainReleaseBuildArtifacts(teamProject: string, releaseId: number, definitionName: string, connection: azdev.WebApi): Promise<void> {
   const releaseApi: ra.IReleaseApi = await connection.getReleaseApi();
   const release: Release = await releaseApi.getRelease(teamProject, releaseId);
   if (!release.artifacts) return;

   for (const artifact of release.artifacts.filter(x => x.type === 'Build')) {
      const buildId = Number(tl.getVariable(`Release.Artifacts.${artifact.alias}.BuildId`));
      const definitionId = Number(tl.getVariable(`Release.Artifacts.${artifact.alias}.DefinitionId`));
      const daysValid = 40000;
      const owner = `RM:${definitionName} / ${releaseId}`
      await setBuildRetentionLease(teamProject, buildId, definitionId, daysValid, owner, connection);
   }
}

async function setBuildRetentionLease(teamProject: string, runId: number, definitionId: number, daysValid: number, owner: string, connection: azdev.WebApi): Promise<void> {
   const retentionLease: NewRetentionLease[] = [];
   retentionLease.push({
      runId: runId,
      definitionId: definitionId,
      protectPipeline: true,
      daysValid: daysValid,
      ownerId: owner,
   });
   const buildApi: ba.IBuildApi = await connection.getBuildApi();
   await buildApi.addRetentionLeases(retentionLease, teamProject);
   const daysValidMessage: string = (daysValid === 40000) ? 'forever' : daysValid.toString()

   console.log(`Retained pipeline run ${runId} for ${daysValidMessage} days.`);
}

function calculateDaysValid(numberOfMonths: number): number {
   // If 0, retain for 30 years
   if (numberOfMonths === 0) numberOfMonths = 30 * 12;
   const endDate = new Date();
   const todayDate = new Date();
   endDate.setMonth(endDate.getMonth() + numberOfMonths);
   const timeDifference = endDate.getTime() - todayDate.getTime();
   const dayDifference = timeDifference / (1000 * 3600 * 24);
   return Math.round(dayDifference);
}

function getAzureDevOpsVariable(name: string): string {
   const value = tl.getVariable(name) || undefined;
   if (value === undefined) throw Error(`Variable ${name} is empty`);
   return value;
}

function getAzureDevOpsInput(name: string): string {
   const value = tl.getInput(name) || undefined;
   if (value === undefined) throw Error(`Input ${name} is empty`);
   return value;
}

async function getAzureDevOpsConnection(collectionUri: string, token: string): Promise<azdev.WebApi> {
   const accessTokenHandler = azdev.getPersonalAccessTokenHandler(token);
   const requestOptions: IRequestOptions = {
      socketTimeout: 10000,
      allowRetries: true,
      maxRetries: 3,
   };

   const agentProxy = tl.getHttpProxyConfiguration();
   let proxyConfiguration: IProxyConfiguration;

   if (agentProxy) {
      proxyConfiguration = {
         proxyUrl: agentProxy.proxyUrl,
         proxyUsername: agentProxy.proxyUsername,
         proxyPassword: agentProxy.proxyPassword,
         proxyBypassHosts: agentProxy.proxyBypassHosts
      }
      requestOptions.proxy = proxyConfiguration;
   }

   const connection = new azdev.WebApi(collectionUri, accessTokenHandler, requestOptions)
   if (!connection) throw Error(`Connection cannot be made to Azure DevOps.`);
   return connection;
}
