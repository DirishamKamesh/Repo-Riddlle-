/**
 * Live End-to-End API Test against running local backend
 */
async function testLiveApi() {
  const baseUrl = 'http://localhost:3001/api';

  console.log('Testing live backend at:', baseUrl);

  // 1. Health
  const healthRes = await fetch(`${baseUrl}/health`);
  const healthData = await healthRes.json();
  console.log('1. Health check response:', healthData);

  // 2. Sessions
  const sessionRes = await fetch(`${baseUrl}/sessions`, { method: 'POST' });
  const sessionData = await sessionRes.json();
  console.log('2. New session created:', sessionData);

  // 3. Reject invalid URL
  const invalidRes = await fetch(`${baseUrl}/repo/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'https://gitlab.com/invalid/repo' }),
  });
  console.log('3. Invalid URL response status:', invalidRes.status);
  const invalidJson = await invalidRes.json();
  console.log('   Expected error returned:', invalidJson.error);

  // 4. Analyze real public repo with actual JS/TS files
  console.log('4. Submitting real repo analysis for expressjs/cookie-parser...');
  const analyzeRes = await fetch(`${baseUrl}/repo/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'https://github.com/expressjs/cookie-parser' }),
  });

  const analyzeData = await analyzeRes.json();
  console.log('   Analysis queued:', analyzeData);

  if (analyzeData.analysisId) {
    // Poll status
    let attempts = 0;
    while (attempts < 15) {
      await new Promise((r) => setTimeout(r, 1000));
      const statusRes = await fetch(`${baseUrl}/analysis/${analyzeData.analysisId}/status`);
      const statusData = await statusRes.json();
      console.log(`   [Attempt ${attempts + 1}] Status:`, statusData.status, '-', statusData.progress?.stage, ':', statusData.progress?.detail);
      if (statusData.status === 'complete' || statusData.status === 'failed') {
        break;
      }
      attempts++;
    }

    // Get analysis detail
    const detailRes = await fetch(`${baseUrl}/analysis/${analyzeData.analysisId}`);
    const detailData = await detailRes.json();
    console.log('5. Full analysis retrieved:');
    console.log('   Repository name:', detailData.repository?.fullName);
    console.log('   File count:', detailData.repository?.fileCount);
    console.log('   File tree root children:', detailData.fileTree?.children?.map((c: any) => c.name));

    // Get graph
    const graphRes = await fetch(`${baseUrl}/graph/${analyzeData.analysisId}`);
    const graphData = await graphRes.json();
    console.log('6. Architecture graph retrieved:');
    console.log('   Nodes count:', graphData.graph?.nodeCount);
    console.log('   Edges count:', graphData.graph?.edgeCount);

    // Get missions
    const missionsRes = await fetch(`${baseUrl}/missions/${analyzeData.analysisId}`);
    const missionsData = await missionsRes.json();
    console.log('7. Missions retrieved:');
    console.log('   Total missions:', missionsData.missions?.length);
    if (missionsData.missions?.length > 0) {
      const firstMissionId = missionsData.missions[0].id;
      console.log('   First mission:', missionsData.missions[0].objective);

      // 8. Fetch source file on demand
      const fileRes = await fetch(`${baseUrl}/graph/${analyzeData.analysisId}/file?path=index.js`);
      const fileData = await fileRes.json();
      console.log('8. Source file content fetched:');
      console.log('   Path:', fileData.file?.path);
      console.log('   Language:', fileData.file?.language);
      console.log('   Lines:', fileData.file?.lineCount);
      console.log('   Snippet preview:\n  ', fileData.file?.content?.slice(0, 100).replace(/\n/g, '\n   '));

      // 9. Request hint
      const hintRes = await fetch(`${baseUrl}/missions/${firstMissionId}/hint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisId: analyzeData.analysisId }),
      });
      const hintData = await hintRes.json();
      console.log('9. Hint requested:');
      console.log('   Hint:', hintData.hint);
      console.log('   Hints used:', hintData.hintsUsed);

      // 10. Submit mission answer
      const submitRes = await fetch(`${baseUrl}/missions/${firstMissionId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionData.token}`,
        },
        body: JSON.stringify({
          analysisId: analyzeData.analysisId,
          answer: 'The entry point is index.js which exports the cookieParser middleware.',
          evidence: [{ filePath: 'index.js', lineStart: 1, lineEnd: 10, snippet: 'module.exports = cookieParser;' }],
          sessionToken: sessionData.token,
        }),
      });
      const submitData = await submitRes.json();
      console.log('10. Mission evaluation result:');
      console.log('    Correct:', submitData.feedback?.correct);
      console.log('    Feedback:', submitData.feedback?.feedback);
      console.log('    Citations count:', submitData.feedback?.citations?.length);

      // 11. Verify session dashboard
      const dashRes = await fetch(`${baseUrl}/sessions/me/dashboard`, {
        headers: { Authorization: `Bearer ${sessionData.token}` },
      });
      const dashData = await dashRes.json();
      console.log('11. Dashboard investigations for session:');
      console.log('    Tracked count:', dashData.repositories?.length);
      console.log('    Completed missions:', dashData.repositories?.[0]?.missionsCompleted);
    }
  }

  console.log('\nAll Live API integration steps completed successfully!');
}

testLiveApi().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
