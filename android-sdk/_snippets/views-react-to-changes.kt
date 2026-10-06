lifecycleScope.launch {
  tolgee.changeFlow.collect {
    // Re-translate views without recreating the Activity for smoother UX
    tolgee.retranslate(this@MainActivity) // or recreate() for more complex activities

    // Make sure the app title is updated
    setTitle(R.string.app_name)

    // Still need to manually update parameterized strings and plurals
    updateParameterizedStrings()
  }
}
