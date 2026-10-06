@Composable
@OptIn(ExperimentalCoroutinesApi::class)
fun isLocaleSelected(locale: String, fallback: Boolean): Boolean {
  val tolgee = Tolgee.instance
  return remember(tolgee) {
    tolgee.changeFlow.mapLatest {
      tolgee.isLocaleSelected(locale, fallback)
    }
  }.collectAsState(initial = tolgee.isLocaleSelected(locale, fallback)).value
}
