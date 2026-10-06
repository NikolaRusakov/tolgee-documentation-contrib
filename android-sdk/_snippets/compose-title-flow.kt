lifecycleScope.launch {
  // Keep the Activity title updated
  Tolgee.instance.tFlow(this@MainActivity, R.string.app_name).collect { title = it }
}
