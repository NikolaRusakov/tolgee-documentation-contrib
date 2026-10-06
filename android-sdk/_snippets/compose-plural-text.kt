@Composable
fun PluralText(count: Int, param: Int, modifier: Modifier = Modifier) {
  // Plurals are also supported
  Text(
    text = pluralStringResource(R.plurals.plr_test_placeholder_2, count, param, "Plurals"),
    modifier = modifier
  )
}
