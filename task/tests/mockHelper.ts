import { NewRetentionLease } from 'azure-devops-node-api/interfaces/BuildInterfaces';
import { Release, ReleaseUpdateMetadata } from 'azure-devops-node-api/interfaces/ReleaseInterfaces';
import * as mr from 'azure-pipelines-task-lib/mock-run';

export function BuildWithAddBuildTagsMock(taskMockRunner: mr.TaskMockRunner, teamProject: string, RunId, DefinitionId?): mr.TaskMockRunner {
	// Mock WebApi
	taskMockRunner.registerMock('azure-devops-node-api/WebApi', {
		getPersonalAccessTokenHandler: async function (token) {
			return;
		},
		WebApi: function () {
			return {
				getBuildApi: async function () {
					return {
						addRetentionLeases: async function (retentionLease: NewRetentionLease, passedTeamProject) {
							if (teamProject !== passedTeamProject) throw `teamProject is not correctly passed: ${passedTeamProject}`
							return;
						},
					}
				},
				getReleaseApi: async function () {
					return {
						updateReleaseResource: async function (passedTareleaseMetadatags: ReleaseUpdateMetadata, passedTeamProject, releaseId) {
							if (teamProject !== passedTeamProject) throw `teamProject is not correctly passed: ${passedTeamProject}`
							if (releaseId !== RunId) throw `ReleaseId is not correctly passed: ${RunId}`
							if (passedTareleaseMetadatags.keepForever === false ) throw `keepForever is not correctly set`
							return;
						},
						getRelease: async function (passedTeamProject, passedId) {
							if (teamProject !== passedTeamProject) throw `teamProject is not correctly passed: ${passedTeamProject}`;
							if (passedId !== RunId) throw `Id is not correctly passed: ${passedId}`;
							const release: Release  = {
								artifacts: 
								[
									{ alias : 'build', type: 'Build'},
									{ alias : 'git', type: 'Git'},
								],
							}
							return release;
						},
					}
				},
			}
		}

	});
	return taskMockRunner;
}