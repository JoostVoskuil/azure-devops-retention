"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const assert = __importStar(require("assert"));
const ttm = __importStar(require("azure-pipelines-task-lib/mock-test"));
describe('Input Tests', function () {
    it('Should fail when System.EnableAccessToken is not provided', function (done) {
        const tp = path.join(__dirname, 'AccessToken_EnableAccessTokenNotProvided');
        const tr = new ttm.MockTestRunner(tp);
        tr.run();
        assert.strictEqual(tr.failed, true, 'should have failed');
        assert.strictEqual(tr.stdout.indexOf('System.AccessToken is not available.') >= 0, true, 'Should contain: System.AccessToken is not available.');
        done();
    });
    it('Should fail when Hosttype is unknown', function (done) {
        const tp = path.join(__dirname, 'Unknown_HostType');
        const tr = new ttm.MockTestRunner(tp);
        tr.run();
        assert.strictEqual(tr.failed, true, 'should have failed');
        assert.strictEqual(tr.stdout.indexOf('Unknown hosttype') >= 0, true, 'Should contain: Unknown hosttype.');
        done();
    });
});
describe('Retain Builds', function () {
    it('Should succeed in retaining a build/pipeline', function (done) {
        const tp = path.join(__dirname, 'Retain_Build');
        const tr = new ttm.MockTestRunner(tp);
        tr.run();
        assert.strictEqual(tr.succeeded, true, 'should have succeeded');
        assert.strictEqual(tr.stdout.indexOf('Retained pipeline run 123') >= 0, true, 'Should contain: Retained pipeline run 123');
        done();
    });
});
describe('Retain Releases', function () {
    it('Should succeed in retaining a release', function (done) {
        const tp = path.join(__dirname, 'Retain_Release');
        const tr = new ttm.MockTestRunner(tp);
        tr.run();
        assert.strictEqual(tr.succeeded, true, 'should have succeeded');
        assert.strictEqual(tr.stdout.indexOf('Retained this release forever.') >= 0, true, 'Should contain: Retained this pipeline run');
        done();
    });
    it('Should succeed in retaining a release including its builds', function (done) {
        const tp = path.join(__dirname, 'Retain_ReleaseWithArtifacts');
        const tr = new ttm.MockTestRunner(tp);
        tr.run();
        assert.strictEqual(tr.succeeded, true, 'should have succeeded');
        assert.strictEqual(tr.stdout.indexOf('Retained this release forever.') >= 0, true, 'Should contain: Retained this pipeline run for');
        assert.strictEqual(tr.stdout.indexOf('Retained pipeline run 123') >= 0, true, 'Should contain: Pipelines: Retained pipeline run 123');
        done();
    });
});
describe('Retain Deployments', function () {
    it('Should succeed in retaining a release in deployment', function (done) {
        const tp = path.join(__dirname, 'Retain_Deployment');
        const tr = new ttm.MockTestRunner(tp);
        tr.run();
        assert.strictEqual(tr.succeeded, true, 'should have succeeded');
        assert.strictEqual(tr.stdout.indexOf('Retained this release forever.') >= 0, true, 'Should contain: Retained this pipeline run for ');
        done();
    });
});
//# sourceMappingURL=_suite.js.map