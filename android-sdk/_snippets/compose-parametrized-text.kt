@Composable
fun ParametrizedText(name: String, modifier: Modifier = Modifier) {
  // Passing parameters for the stringResource is supported
  Text(
    text = stringResource(R.string.percentage_placeholder, name),
    modifier = modifier
  )
}
