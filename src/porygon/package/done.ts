let done = false;

export function packageSetupIsDone() {
  return done;
}

export function markPackageSetupAsDone() {
  done = true;
}
