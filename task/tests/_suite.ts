import * as path from 'path';
import * as assert from 'assert';
import * as ttm from 'azure-pipelines-task-lib/mock-test';


describe('Input Tests', function () {
    it('Should fail when System.EnableAccessToken is not provided', async function() { 
        const tp = path.join(__dirname, 'AccessToken_EnableAccessTokenNotProvided');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);
        await tr.runAsync();
        assert.strictEqual(tr.failed, true, 'should have failed');
        assert.strictEqual(tr.stdout.indexOf('System.AccessToken is not available.') >= 0, true, 'Should contain: System.AccessToken is not available.');

    });
    it('Should fail when Hosttype is unknown', async function() {    
        const tp = path.join(__dirname, 'Unknown_HostType');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);
        await tr.runAsync();
        assert.strictEqual(tr.failed, true, 'should have failed');
        assert.strictEqual(tr.stdout.indexOf('Unknown hosttype') >= 0, true, 'Should contain: Unknown hosttype.');
    });
});

describe('Retain Builds', function () {
    it('Should succeed in retaining a build/pipeline', async function() {    
        const tp = path.join(__dirname, 'Retain_Build');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);
        await tr.runAsync();
        assert.strictEqual(tr.succeeded, true, 'should have succeeded');
        assert.strictEqual(tr.stdout.indexOf('Retained pipeline run 123') >= 0, true, 'Should contain: Retained pipeline run 123');
    });
});

describe('Retain Releases', function () {
    it('Should succeed in retaining a release', async function() {    
        const tp = path.join(__dirname, 'Retain_Release');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);
        await tr.runAsync();
        assert.strictEqual(tr.succeeded, true, 'should have succeeded');
        assert.strictEqual(tr.stdout.indexOf('Retained this release forever.') >= 0, true, 'Should contain: Retained this pipeline run');
    });
    it('Should succeed in retaining a release including its builds', async function() {   
        const tp = path.join(__dirname, 'Retain_ReleaseWithArtifacts');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);
        await tr.runAsync();
        assert.strictEqual(tr.succeeded, true, 'should have succeeded');
        assert.strictEqual(tr.stdout.indexOf('Retained this release forever.') >= 0, true, 'Should contain: Retained this pipeline run for');
        assert.strictEqual(tr.stdout.indexOf('Retained pipeline run 123') >= 0, true, 'Should contain: Pipelines: Retained pipeline run 123');

    });
});

describe('Retain Deployments', function () {
    it('Should succeed in retaining a release in deployment', async function() {
        const tp = path.join(__dirname, 'Retain_Deployment');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);
        await tr.runAsync();
        assert.strictEqual(tr.succeeded, true, 'should have succeeded');
        assert.strictEqual(tr.stdout.indexOf('Retained this release forever.') >= 0, true, 'Should contain: Retained this pipeline run for ');
    });
});