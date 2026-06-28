import { defineConfig } from 'vite';
import { execSync } from 'child_process';

// Get version from Git tags or commit hash
let gitVersion = '0.0.0';
try {
  // Use tag name if exists, e.g., 'v1.0.0'.
  // If not, falls back to short commit hash
  gitVersion = execSync('git describe --tags --always').toString().trim();
} catch (e) {
  try {
    gitVersion = execSync('git rev-parse --short HEAD').toString().trim();
  } catch (err) {
    gitVersion = '0.0.0';
  }
}

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(gitVersion)
  }
});
