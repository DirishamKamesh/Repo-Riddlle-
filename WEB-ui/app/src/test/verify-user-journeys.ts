import { validateGithubUrl } from '../lib/github-url-validator';
import { classifyFilePath } from '../lib/file-classifier';
import { MISSION_EVALUATION_RULES } from '../mock/missions';
import { useInvestigationStore } from '../store/investigation-store';
import { DEMO_GRAPH_DATA } from '../mock/graph-data';
import { DEMO_SOURCE_FILES } from '../mock/source-files';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

console.log('====================================================');
console.log('RepoRiddle Verification & User Journey Test Suite');
console.log('====================================================\n');

// 1. GitHub URL Validation
console.log('[Suite 1] Landing Page: GitHub URL Validation');
assert(
  validateGithubUrl('https://github.com/expressjs/express').valid === true,
  'Valid https GitHub URL passes'
);
assert(
  validateGithubUrl('http://github.com/facebook/react').valid === true,
  'Valid http GitHub URL passes'
);
assert(
  validateGithubUrl('github.com/demo-org/task-api').valid === true,
  'Valid naked github.com URL auto-prefixes https and passes'
);
assert(
  validateGithubUrl('https://github.com/facebook/react/tree/main').valid === false,
  'Branch URL (/tree/main) is rejected with helpful error'
);
assert(
  validateGithubUrl('https://github.com/facebook/react/blob/main/README.md').valid === false,
  'Blob file URL (/blob/main) is rejected'
);
assert(
  validateGithubUrl('https://github.com/facebook/react/pull/1234').valid === false,
  'Pull request URL (/pull/1234) is rejected'
);
assert(
  validateGithubUrl('https://gitlab.com/owner/repo').valid === false,
  'Non-GitHub URL is rejected'
);
assert(
  validateGithubUrl('').valid === false,
  'Empty string is invalid without crash'
);

// 2. File Classifier & Category Tokens
console.log('\n[Suite 2] Codebase Ingestion: File Path Classification');
assert(
  classifyFilePath('src/server.ts').category === 'entry_point',
  'server.ts classified as entry_point'
);
assert(
  classifyFilePath('src/app.ts').category === 'entry_point',
  'app.ts classified as entry_point'
);
assert(
  classifyFilePath('src/routes/tasks.ts').category === 'route',
  'routes/tasks.ts classified as route'
);
assert(
  classifyFilePath('src/models/task.ts').category === 'model',
  'models/task.ts classified as model'
);
assert(
  classifyFilePath('src/components/Button.tsx').category === 'component',
  'components/Button.tsx classified as component'
);
assert(
  classifyFilePath('tests/tasks.test.ts').category === 'test',
  'tests/tasks.test.ts classified as test'
);
assert(
  classifyFilePath('package.json').category === 'config',
  'package.json classified as config'
);
assert(
  classifyFilePath('src/utils/logger.ts').category === 'utility',
  'utils/logger.ts classified as utility'
);

// 3. Graph Accuracy & Verified Imports
console.log('\n[Suite 3] Graph Integrity: Only Verified Static Imports');
assert(
  DEMO_GRAPH_DATA.edges.every((e) => e.type === 'import' && e.confirmed === true),
  'All rendered graph edges are confirmed static imports'
);
assert(
  DEMO_GRAPH_DATA.edges.length === 9,
  'Graph contains exactly 9 verified import edges matching AST fixture'
);
// Verify import targets exist in source files
const allSources = Object.keys(DEMO_SOURCE_FILES);
const validSources = DEMO_GRAPH_DATA.nodes.every((n) => allSources.includes(n.filePath));
assert(validSources, 'Every node in the architecture graph has an actual source file fixture');

// 4. Mission Evaluation Rules
console.log('\n[Suite 4] Forensic Missions: Deterministic Evaluation');

// Mission 1: Entry Point
const m1Rule = MISSION_EVALUATION_RULES['mission-1'];
const m1Correct = m1Rule.evaluate('The application starts in src/server.ts which listens on PORT.', []);
assert(m1Correct.correct === true && m1Correct.partial === false, 'Mission 1: server.ts answer is CORRECT');

const m1Partial = m1Rule.evaluate('The entry point is src/app.ts where Express is configured.', []);
assert(m1Partial.correct === false && m1Partial.partial === true, 'Mission 1: app.ts answer is PARTIAL (distinguishes app vs bootstrap)');

const m1Fail = m1Rule.evaluate('I think it is in tests/tasks.test.ts', []);
assert(m1Fail.correct === false && m1Fail.partial === false, 'Mission 1: Wrong file is FAIL');

// Mission 2: Route Location and Model
const m2Rule = MISSION_EVALUATION_RULES['mission-2'];
const m2Correct = m2Rule.evaluate('src/routes/tasks.ts defines POST /tasks, and src/models/task.ts TaskSchema validates it.', []);
assert(m2Correct.correct === true && m2Correct.partial === false, 'Mission 2: Route + Schema answer is CORRECT');

const m2Partial = m2Rule.evaluate('Handled in src/routes/tasks.ts', []);
assert(m2Partial.correct === false && m2Partial.partial === true, 'Mission 2: Route without Schema is PARTIAL');

const m2Fail = m2Rule.evaluate('Handled in server.ts', []);
assert(m2Fail.correct === false && m2Fail.partial === false, 'Mission 2: Irrelevant file is FAIL');

// Mission 3: Error Handling
const m3Rule = MISSION_EVALUATION_RULES['mission-3'];
const m3Correct = m3Rule.evaluate('src/middleware/error-handler.ts formats all errors into JSON with status codes.', []);
assert(m3Correct.correct === true && m3Correct.partial === false, 'Mission 3: error-handler.ts answer is CORRECT');

const m3Partial = m3Rule.evaluate('src/app.ts has the error handling', []);
assert(m3Partial.correct === false && m3Partial.partial === true, 'Mission 3: app.ts mount without handler is PARTIAL');

const m3Fail = m3Rule.evaluate('Random irrelevant answer', []);
assert(m3Fail.correct === false && m3Fail.partial === false, 'Mission 3: Irrelevant answer is FAIL');

// 5. Store State Transitions & Progression
console.log('\n[Suite 5] Store State Transitions & Mission Progression');
const store = useInvestigationStore.getState();
store.loadDemoRepository();

const freshState = useInvestigationStore.getState();
assert(freshState.activeMissionId === 'mission-1', 'Initial active mission is mission-1');
assert(freshState.missions[0].status === 'active', 'Mission 1 is initially active');
assert(freshState.missions[1].status === 'available', 'Mission 2 is initially available');
assert(freshState.missions[2].status === 'locked', 'Mission 3 is initially locked');

// Hints system test
assert(freshState.usedHintsCount === 0, 'Initial used hints count is 0');
store.requestNextHint();
assert(useInvestigationStore.getState().usedHintsCount === 1, 'Request next hint increments count to 1');
store.requestNextHint();
store.requestNextHint();
store.requestNextHint(); // Should not overflow 3
assert(useInvestigationStore.getState().usedHintsCount <= 3, 'Used hints count does not exceed max hints');

// Evidence pinning test
store.addEvidence({
  filePath: 'src/server.ts',
  lineStart: 12,
  lineEnd: 18,
  snippet: 'const server = app.listen(PORT);',
});
const withEvidence = useInvestigationStore.getState();
assert(withEvidence.evidence.length === 1, 'Evidence pinning adds item to list');
const evId = withEvidence.evidence[0].id;

store.removeEvidence(evId);
assert(useInvestigationStore.getState().evidence.length === 0, 'Evidence removal deletes item');

// Submission & progression test:
// 1. Submit fail answer -> mission does NOT complete
store.submitMissionAnswer('completely wrong answer');
const stateAfterFail = useInvestigationStore.getState();
assert(stateAfterFail.feedback?.correct === false, 'Feedback registers fail');
assert(stateAfterFail.missions[0].status !== 'completed', 'Mission 1 remains NOT completed after fail');
assert(stateAfterFail.missions[2].status === 'locked', 'Mission 3 remains locked');

// 2. Submit correct answer -> mission completes, unlocks mission 2/3
store.submitMissionAnswer('src/server.ts is the bootstrap file.');
const stateAfterCorrect = useInvestigationStore.getState();
assert(stateAfterCorrect.feedback?.correct === true, 'Feedback registers correct');
assert(stateAfterCorrect.missions[0].status === 'completed', 'Mission 1 marked COMPLETED');

// Summary
console.log('\n====================================================');
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log('====================================================');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('All user journey verification tests passed successfully!\n');
}
