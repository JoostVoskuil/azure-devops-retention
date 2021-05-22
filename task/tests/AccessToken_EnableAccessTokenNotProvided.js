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
const taskPath = path.join(__dirname, '..', 'index.js');
let tmr = new mr.TaskMockRunner(taskPath);
// Inputs
tmr.setInput('tags', 'tag1');
tmr.run();
//# sourceMappingURL=AccessToken_EnableAccessTokenNotProvided.js.map