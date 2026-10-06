@Composable
fun App() {
    // no remember required, using a singleton
    val tolgee = Tolgee.instance

    MaterialTheme {
        Column {
            // Use tolgee version of stringResource composable
            Text(text = stringResource(Res.string.description))
            Text(text = stringResource(Res.string.percentage_placeholder, "87"))
            Button(
                onClick = {
                    tolgee.setLocale("en")
                }
            ) {
                Text(text = "English")
            }
            Button(
                onClick = {
                    tolgee.setLocale("fr")
                }
            ) {
                Text(text = "Français")
            }
            Button(
                onClick = {
                    tolgee.setLocale("cs")
                }
            ) {
                Text(text = "Čeština")
            }
        }
    }
}
