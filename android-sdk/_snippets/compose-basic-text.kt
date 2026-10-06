@Composable
fun BasicText(modifier: Modifier = Modifier) {
  // Use tolgee version of stringResource composable
  Text(
    text = stringResource(R.string.description),
    modifier = modifier
  )
}
