import * as mr from 'azure-pipelines-task-lib/mock-run';
import path = require('path');
import { BuildWithAddBuildTagsMock } from './mockHelper';

const taskPath = path.join(__dirname, '..', 'index.js');
let tmr: mr.TaskMockRunner = new mr.TaskMockRunner(taskPath);

// Inputs
const teamProject = 'TestTeamProject';

const buildId = 123;
const definitionId = 321;
const months = 36;

tmr.setInput('owner','Owner');
tmr.setInput('retainbuilds', 'true');
tmr.setInput('months', months.toString());

// Environment Settings
process.env['SYSTEM_TEAMPROJECT'] = teamProject
process.env['SYSTEM_HOSTTYPE'] = 'build'
process.env['BUILD_BUILDID'] = buildId.toString();
process.env['SYSTEM_DEFINITIONID'] = definitionId.toString();

// System_AccessToken
process.env['ENDPOINT_AUTH_SCHEME_SYSTEMVSSCONNECTION'] = 'OAuth'
process.env['ENDPOINT_AUTH_PARAMETER_SYSTEMVSSCONNECTION_ACCESSTOKEN'] = 'Accesstoken'
process.env['ENDPOINT_URL_SYSTEMVSSCONNECTION'] = 'https://dev.azure.com/organisation'

tmr = BuildWithAddBuildTagsMock(tmr, teamProject, buildId, definitionId);

tmr.run();
