const { withPodfile } = require("expo/config-plugins")

const POD_LINES = `  pod 'GoogleUtilities', :modular_headers => true
  pod 'RecaptchaInterop', :modular_headers => true`

/** AppCheckCore (Google Sign-In) needs module maps on these ObjC transitive pods. */
function withGooglePodModularHeaders(config) {
  return withPodfile(config, (config) => {
    const marker = "pod 'GoogleUtilities', :modular_headers => true"
    if (!config.modResults.contents.includes(marker)) {
      config.modResults.contents = config.modResults.contents.replace(
        /use_expo_modules!/,
        `use_expo_modules!\n\n${POD_LINES}`,
      )
    }
    return config
  })
}

module.exports = withGooglePodModularHeaders
