"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mr = __importStar(require("azure-pipelines-task-lib/mock-run"));
const path = require("path");
const mockHelper_1 = require("./mockHelper");
const taskPath = path.join(__dirname, '..', 'index.js');
let tmr = new mr.TaskMockRunner(taskPath);
// Inputs
const teamProject = 'TestTeamProject';
const releaseId = 123;
const months = 36;
tmr.setInput('owner', 'Owner');
tmr.setInput('retainbuilds', 'true');
tmr.setInput('months', months.toString());
// Environment Settings
process.env['SYSTEM_TEAMPROJECT'] = teamProject;
process.env['SYSTEM_HOSTTYPE'] = 'deployment';
process.env['RELEASE_RELEASEID'] = releaseId.toString();
process.env['RELEASE_ARTIFACTS_BUILD_BUILDID'] = '123';
process.env['RELEASE_ARTIFACTS_BUILD_DEFINITIONID'] = '321';
// System_AccessToken
process.env['ENDPOINT_AUTH_SCHEME_SYSTEMVSSCONNECTION'] = 'OAuth';
process.env['ENDPOINT_AUTH_PARAMETER_SYSTEMVSSCONNECTION_ACCESSTOKEN'] = 'Accesstoken';
process.env['ENDPOINT_URL_SYSTEMVSSCONNECTION'] = 'https://dev.azure.com/organisation';
tmr = mockHelper_1.BuildWithAddBuildTagsMock(tmr, teamProject, releaseId);
tmr.run();
//# sourceMappingURL=Retain_ReleaseWithArtifacts.js.map