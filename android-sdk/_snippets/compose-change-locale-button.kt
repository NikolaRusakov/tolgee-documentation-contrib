@Composable
fun SingleChoiceSegmentedButtonRowScope.ChangeLocaleButton(index: Int, count: Int, locale: String, name: String) {
  SegmentedButton(
    shape = SegmentedButtonDefaults.itemShape(
      index = index,
      count = count
    ),
    onClick = {
      Tolgee.instance.setLocale(locale)
    },
    selected = isLocaleSelected(locale, index == 0),
    label = { Text(text = name) }
  )
}
