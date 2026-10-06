override fun attachBaseContext(newBase: Context?) {
  // Wrapping base context will make sure getString calls will use tolgee
  super.attachBaseContext(TolgeeContextWrapper.wrap(newBase))
}
