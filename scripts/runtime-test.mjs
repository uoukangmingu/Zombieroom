try {
  await import('jsdom');
  await import('../tests/mode-transition-runtime.test.mjs');
} catch (error) {
  if (error?.code === 'ERR_MODULE_NOT_FOUND' && String(error.message).includes('jsdom')) {
    console.log('jsdom not installed: runtime browser simulation skipped; static navigation/coherence tests remain active');
  } else throw error;
}
